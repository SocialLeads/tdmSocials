import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ContentProcessorService } from '../content/content-processor.service';
import { MailService } from '../outgoing-communication/mail.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly contentProcessor: ContentProcessorService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  // Default: 8 AM daily. Override via CRON_SCHEDULE env var if using dynamic scheduling.
  @Cron('0 8 * * *')
  async handleDailyCron() {
    this.logger.log('Daily content cron triggered');
    try {
      const result = await this.contentProcessor.processDaily();
      this.logger.log(`Cron complete: ${result.sent} sent, ${result.failed} failed`);
    } catch (error) {
      this.logger.error('Daily cron failed', error);
      await this.sendCrashAlert(error);
    }
  }

  private async sendCrashAlert(error: unknown) {
    const adminEmail = this.configService.get<string>('app.adminContactEmail');
    if (!adminEmail) return;

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    const timestamp = new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' });

    try {
      await this.mailService.sendMail({
        to: adminEmail,
        subject: '[TDM Socials] Dagelijkse cron CRASHED',
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#dc2626">Dagelijkse cron is gecrasht</h2>
            <p>De dagelijkse e-mailverwerking is volledig mislukt op <strong>${timestamp}</strong>.</p>
            <p>Er zijn geen e-mails verstuurd. Controleer de logs en herstart indien nodig handmatig via het dashboard.</p>
            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0">
              <strong>Foutmelding:</strong><br/>
              <code style="font-size:13px">${errorMessage}</code>
              ${errorStack ? `<br/><br/><strong>Stack trace:</strong><br/><pre style="font-size:12px;overflow-x:auto">${errorStack}</pre>` : ''}
            </div>
          </div>
        `,
      });
      this.logger.log('Crash alert email sent to admin');
    } catch (mailError) {
      this.logger.error('Failed to send crash alert email', mailError);
    }
  }
}
