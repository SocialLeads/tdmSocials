import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsService } from '../clients/clients.service';
import { AiService } from '../ai/ai.service';
import { FluxService } from '../ai/flux.service';
import { ImageStorageService } from '../ai/image-storage.service';
import { ContentComposerService } from './content-composer.service';
import { MailService } from '../outgoing-communication/mail.service';
import { IndustryContent, PlatformContent, PlatformContentRaw } from '../ai/ai.types';
import { Industry } from '../clients/client.types';

const PLATFORMS = ['TikTok', 'Instagram', 'Facebook', 'X'];
const SEND_DELAY_MS = 100;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface ClientError {
  email: string;
  industry: string;
  error: string;
}

@Injectable()
export class ContentProcessorService {
  private readonly logger = new Logger(ContentProcessorService.name);

  private readonly imageProvider: string;
  private readonly dailyImageLimit: number;
  private isRunning = false;
  private imageCounterDate = '';
  private imageCounterValue = 0;

  constructor(
    private readonly clientsService: ClientsService,
    private readonly aiService: AiService,
    private readonly fluxService: FluxService,
    private readonly imageStorageService: ImageStorageService,
    private readonly composerService: ContentComposerService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {
    this.imageProvider = this.configService.get<string>('IMAGE_PROVIDER', 'flux');
    this.dailyImageLimit = parseInt(this.configService.get<string>('DAILY_IMAGE_LIMIT', '200'), 10);
    this.logger.log(`Image provider configured: ${this.imageProvider}, daily limit: ${this.dailyImageLimit}`);
  }

  async processDaily(clientIds?: string[]): Promise<{ sent: number; failed: number }> {
    if (this.isRunning) {
      this.logger.warn('Daily processing already in progress, skipping.');
      throw new Error('Content processing is already running. Please wait for it to finish.');
    }

    this.isRunning = true;
    try {
    const selectedIds = clientIds?.length ? clientIds : null;
    this.logger.log(`Starting daily content processing — ${selectedIds ? `${selectedIds.length} specific client(s): [${selectedIds.join(', ')}]` : 'ALL clients'}`);
    const startTime = Date.now();

    const allClients = await this.clientsService.findAll();
    const clients = selectedIds
      ? allClients.filter((c) => selectedIds.includes(c.id))
      : allClients;

    this.logger.log(`Filtered: ${clients.length} client(s) from ${allClients.length} total`);

    if (clients.length === 0) {
      this.logger.log('No clients found, skipping.');
      await this.sendAdminReport(0, 0, [], [], 0, 0, 0, startTime);
      return { sent: 0, failed: 0 };
    }

    // Get unique industries and generate content + images for each
    const industriesInUse = [...new Set(clients.map((c) => c.industry))];
    const contentByIndustry = new Map<Industry, IndustryContent>();
    const failedIndustries: string[] = [];
    let imagesGenerated = 0;
    let imagesFailed = 0;

    for (const industry of industriesInUse) {
      try {
        // Generate text content
        const rawContent = await this.aiService.generateReadyContent(industry, PLATFORMS);
        this.logger.log(`Generated content for industry: ${industry}`);

        // Generate images for each platform
        const contentWithImages: PlatformContent[] = [];
        for (const item of rawContent.content) {
          const platformContent = await this.generateImageForContent(item, industry);
          contentWithImages.push(platformContent);
          if (platformContent.imageUrl) {
            imagesGenerated++;
          } else {
            imagesFailed++;
          }
        }

        contentByIndustry.set(industry, {
          industry,
          content: contentWithImages,
        });
      } catch (error) {
        failedIndustries.push(industry);
        this.logger.error(`Failed to generate content for ${industry}`, error);
      }
    }

    // Send emails to each client
    let sent = 0;
    let failed = 0;
    const successfulClientIds: string[] = [];
    const clientErrors: ClientError[] = [];

    for (const client of clients) {
      const industryContent = contentByIndustry.get(client.industry);
      if (!industryContent) {
        failed++;
        clientErrors.push({
          email: client.email,
          industry: client.industry,
          error: 'No content generated for industry (AI generation failed)',
        });
        continue;
      }

      try {
        const html = this.composerService.composeEmail(client.name, client.industry, industryContent);

        await this.mailService.sendMail({
          to: client.email,
          subject: `Dagelijkse Content — ${client.industry}`,
          html,
        });

        successfulClientIds.push(client.id);
        sent++;
        this.logger.log(`Email sent to ${client.email}`);

        await sleep(SEND_DELAY_MS);
      } catch (error: any) {
        failed++;
        clientErrors.push({
          email: client.email,
          industry: client.industry,
          error: error?.message || 'Unknown SMTP error',
        });
        this.logger.error(`Failed to send email to ${client.email}`, error);
      }
    }

    // Batch-increment counters for successful sends
    if (successfulClientIds.length > 0) {
      await this.clientsService.incrementEmailCounters(successfulClientIds);
    }

    this.logger.log(`Daily processing complete: ${sent} sent, ${failed} failed, ${imagesGenerated} images generated, ${imagesFailed} images failed`);

    // Send admin summary report
    await this.sendAdminReport(sent, failed, clientErrors, failedIndustries, industriesInUse.length, imagesGenerated, imagesFailed, startTime);

    return { sent, failed };
    } finally {
      this.isRunning = false;
    }
  }

  private async generateImageForContent(
    item: PlatformContentRaw,
    industry: string,
  ): Promise<PlatformContent> {
    let imageUrl: string | null = null;

    if (item.imagePrompt) {
      if (this.isDailyLimitReached()) {
        this.logger.error(`DAILY IMAGE LIMIT REACHED (${this.dailyImageLimit}). Skipping image for ${item.platform}/${industry}.`);
        return { platform: item.platform, postText: item.postText, hashtags: item.hashtags, callToAction: item.callToAction, imageUrl: null };
      }

      try {
        this.logger.log(`Generating image for ${item.platform}/${industry} using provider: ${this.imageProvider} [${this.imageCounterValue}/${this.dailyImageLimit} today]`);

        const maxAttempts = 3;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          this.logger.log(`Image attempt ${attempt}/${maxAttempts} for ${item.platform}/${industry}`);

          const filename = this.imageStorageService.generateFilename(industry, item.platform);
          let savedUrl = '';

          this.incrementImageCounter();

          const tempUrl = this.imageProvider === 'dalle'
            ? await this.aiService.generateImage(item.imagePrompt)
            : await this.fluxService.generateImage(item.imagePrompt);
          if (tempUrl) {
            savedUrl = await this.imageStorageService.saveImageFromUrl(tempUrl, filename);
          }

          if (savedUrl) {
            imageUrl = savedUrl;
            this.logger.log(`Image saved on attempt ${attempt}: ${filename}`);
            break;
          }

          this.logger.warn(`Image blank/filtered on attempt ${attempt}, ${attempt < maxAttempts ? 'retrying...' : 'giving up'}`);
        }
      } catch (error: any) {
        this.logger.error(`Image generation failed for ${item.platform}/${industry}: ${error?.message || error}`);
      }
    } else {
      this.logger.warn(`No imagePrompt for ${item.platform}/${industry}`);
    }

    return {
      platform: item.platform,
      postText: item.postText,
      hashtags: item.hashtags,
      callToAction: item.callToAction,
      imageUrl,
    };
  }

  private async sendAdminReport(
    sent: number,
    failed: number,
    clientErrors: ClientError[],
    failedIndustries: string[],
    totalIndustries: number,
    imagesGenerated: number,
    imagesFailed: number,
    startTime: number,
  ): Promise<void> {
    const adminEmail = this.configService.get<string>('app.adminContactEmail');
    if (!adminEmail) return;

    const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
    const now = new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' });
    const hasErrors = failed > 0 || failedIndustries.length > 0;
    const status = hasErrors ? 'Problemen gedetecteerd' : 'Alles goed';

    let errorsHtml = '';
    if (failedIndustries.length > 0) {
      errorsHtml += `
        <h3 style="color:#dc2626;margin:16px 0 8px;">AI-generatie mislukt</h3>
        <p style="font-size:14px;color:#4b5563;">Contentgeneratie is mislukt voor deze branches — er zijn geen e-mails verstuurd naar klanten in deze sectoren:</p>
        <ul style="font-size:14px;color:#4b5563;">
          ${failedIndustries.map((i) => `<li>${i}</li>`).join('')}
        </ul>`;
    }

    if (clientErrors.length > 0) {
      errorsHtml += `
        <h3 style="color:#dc2626;margin:16px 0 8px;">Mislukte verzendingen</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr style="background:#fee2e2;">
            <th style="text-align:left;padding:8px;border:1px solid #fecaca;">Klant</th>
            <th style="text-align:left;padding:8px;border:1px solid #fecaca;">Branche</th>
            <th style="text-align:left;padding:8px;border:1px solid #fecaca;">Fout</th>
          </tr>
          ${clientErrors
            .map(
              (e) => `
            <tr>
              <td style="padding:8px;border:1px solid #e5e7eb;">${e.email}</td>
              <td style="padding:8px;border:1px solid #e5e7eb;">${e.industry}</td>
              <td style="padding:8px;border:1px solid #e5e7eb;color:#dc2626;">${e.error}</td>
            </tr>`,
            )
            .join('')}
        </table>`;
    }

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:${hasErrors ? '#fef2f2' : '#f0fdf4'};border-left:4px solid ${hasErrors ? '#dc2626' : '#16a34a'};padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:20px;">
          <h2 style="margin:0 0 4px;font-size:18px;color:${hasErrors ? '#dc2626' : '#16a34a'};">
            Dagelijks rapport — ${status}
          </h2>
          <p style="margin:0;font-size:13px;color:#6b7280;">${now} | Duur: ${durationSec}s</p>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px;">
          <tr>
            <td style="padding:10px 16px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600;">E-mails verzonden</td>
            <td style="padding:10px 16px;border:1px solid #e5e7eb;color:#16a34a;font-weight:700;font-size:18px;">${sent}</td>
          </tr>
          <tr>
            <td style="padding:10px 16px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600;">E-mails mislukt</td>
            <td style="padding:10px 16px;border:1px solid #e5e7eb;color:${failed > 0 ? '#dc2626' : '#16a34a'};font-weight:700;font-size:18px;">${failed}</td>
          </tr>
          <tr>
            <td style="padding:10px 16px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600;">Branches verwerkt</td>
            <td style="padding:10px 16px;border:1px solid #e5e7eb;">${totalIndustries} (${failedIndustries.length} mislukt)</td>
          </tr>
          <tr>
            <td style="padding:10px 16px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600;">Afbeeldingen gegenereerd</td>
            <td style="padding:10px 16px;border:1px solid #e5e7eb;">${imagesGenerated} ${imagesFailed > 0 ? `<span style="color:#dc2626;">(${imagesFailed} mislukt)</span>` : ''}</td>
          </tr>
        </table>

        ${errorsHtml}

        ${!hasErrors ? '<p style="font-size:14px;color:#16a34a;">Alle e-mails succesvol afgeleverd. Geen fouten.</p>' : ''}

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="font-size:12px;color:#9ca3af;">TDM Socials — Automatisch dagelijks rapport</p>
      </div>`;

    try {
      await this.mailService.sendMail({
        to: adminEmail,
        subject: `[TDM Socials] Dagrapport: ${sent} verzonden, ${failed} mislukt — ${status}`,
        html,
      });
      this.logger.log('Admin report email sent');
    } catch (error) {
      this.logger.error('Failed to send admin report email', error);
    }
  }

  private isDailyLimitReached(): boolean {
    const today = new Date().toISOString().split('T')[0];
    if (this.imageCounterDate !== today) {
      this.imageCounterDate = today;
      this.imageCounterValue = 0;
    }
    return this.imageCounterValue >= this.dailyImageLimit;
  }

  private incrementImageCounter(): void {
    const today = new Date().toISOString().split('T')[0];
    if (this.imageCounterDate !== today) {
      this.imageCounterDate = today;
      this.imageCounterValue = 0;
    }
    this.imageCounterValue++;
  }
}
