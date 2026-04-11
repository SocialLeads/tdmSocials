import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsService } from '../clients/clients.service';
import { AiService } from '../ai/ai.service';
import { ContentComposerService } from './content-composer.service';
import { MailService } from '../outgoing-communication/mail.service';
import { ContentIdeas } from '../ai/ai.types';
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

  constructor(
    private readonly clientsService: ClientsService,
    private readonly aiService: AiService,
    private readonly composerService: ContentComposerService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async processDaily(): Promise<{ sent: number; failed: number }> {
    this.logger.log('Starting daily content processing...');
    const startTime = Date.now();

    const clients = await this.clientsService.findAll();
    if (clients.length === 0) {
      this.logger.log('No clients found, skipping.');
      await this.sendAdminReport(0, 0, [], [], 0, startTime);
      return { sent: 0, failed: 0 };
    }

    // Get unique industries and generate content for each
    const industriesInUse = [...new Set(clients.map((c) => c.industry))];
    const contentByIndustry = new Map<Industry, ContentIdeas>();
    const failedIndustries: string[] = [];

    for (const industry of industriesInUse) {
      try {
        const ideas = await this.aiService.generateContentIdeas(industry, PLATFORMS);
        contentByIndustry.set(industry, ideas);
        this.logger.log(`Generated content for industry: ${industry}`);
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
      const ideas = contentByIndustry.get(client.industry);
      if (!ideas) {
        failed++;
        clientErrors.push({
          email: client.email,
          industry: client.industry,
          error: 'No content generated for industry (AI generation failed)',
        });
        continue;
      }

      try {
        const html = this.composerService.composeEmail(client.name, client.industry, ideas);

        await this.mailService.sendMail({
          to: client.email,
          subject: `Your Daily Content Ideas - ${client.industry}`,
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

    this.logger.log(`Daily processing complete: ${sent} sent, ${failed} failed`);

    // Send admin summary report
    await this.sendAdminReport(sent, failed, clientErrors, failedIndustries, industriesInUse.length, startTime);

    return { sent, failed };
  }

  private async sendAdminReport(
    sent: number,
    failed: number,
    clientErrors: ClientError[],
    failedIndustries: string[],
    totalIndustries: number,
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
}
