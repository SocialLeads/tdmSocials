import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../outgoing-communication/mail.service';

export interface CreditBalance {
  service: string;
  balance: number;
  currency: string;
  dashboardUrl: string;
}

@Injectable()
export class CreditMonitorService {
  private readonly logger = new Logger(CreditMonitorService.name);
  private readonly falAdminKey: string;
  private readonly threshold: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {
    this.falAdminKey = this.configService.get<string>('FAL_ADMIN_API_KEY', '');
    this.threshold = parseFloat(this.configService.get<string>('CREDIT_ALERT_THRESHOLD', '20'));
  }

  async checkAndAlert(): Promise<void> {
    const balances = await this.checkAllBalances();
    const low = balances.filter((b) => b.balance < this.threshold);

    if (low.length > 0) {
      await this.sendLowCreditAlert(low, balances);
    } else {
      this.logger.log(`All credit balances OK: ${balances.map((b) => `${b.service}: $${b.balance.toFixed(2)}`).join(', ')}`);
    }
  }

  async checkAllBalances(): Promise<CreditBalance[]> {
    const balances: CreditBalance[] = [];

    const falBalance = await this.checkFalBalance();
    if (falBalance) balances.push(falBalance);

    return balances;
  }

  private async sendLowCreditAlert(lowBalances: CreditBalance[], allBalances: CreditBalance[]): Promise<void> {
    const adminEmail = this.configService.get<string>('app.adminContactEmail');
    if (!adminEmail) return;

    const timestamp = new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' });
    const rows = allBalances
      .map((b) => {
        const isLow = b.balance < this.threshold;
        return `
        <tr>
          <td style="padding:10px 16px;border:1px solid #e5e7eb;font-weight:600;">${b.service}</td>
          <td style="padding:10px 16px;border:1px solid #e5e7eb;color:${isLow ? '#dc2626' : '#16a34a'};font-weight:700;font-size:18px;">$${b.balance.toFixed(2)}</td>
          <td style="padding:10px 16px;border:1px solid #e5e7eb;"><a href="${b.dashboardUrl}" style="color:#4f46e5;">Dashboard</a></td>
        </tr>`;
      })
      .join('');

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:20px;">
          <h2 style="margin:0 0 4px;font-size:18px;color:#dc2626;">Laag tegoed gedetecteerd</h2>
          <p style="margin:0;font-size:13px;color:#6b7280;">${timestamp}</p>
        </div>
        <p style="font-size:14px;color:#374151;margin-bottom:16px;">Het tegoed voor afbeeldingsgeneratie is laag (drempel: $${this.threshold.toFixed(2)}). De dagelijkse contentgeneratie kan mislukken als het tegoed niet wordt aangevuld.</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px;">
          <tr style="background:#f9fafb;">
            <th style="text-align:left;padding:10px 16px;border:1px solid #e5e7eb;">Dienst</th>
            <th style="text-align:left;padding:10px 16px;border:1px solid #e5e7eb;">Resterend</th>
            <th style="text-align:left;padding:10px 16px;border:1px solid #e5e7eb;">Actie</th>
          </tr>
          ${rows}
        </table>
        <p style="font-size:13px;color:#6b7280;margin-bottom:8px;">OpenAI-tegoed (tekstgeneratie) kan niet automatisch worden gecontroleerd. Controleer dit handmatig op <a href="https://platform.openai.com/account/billing" style="color:#4f46e5;">platform.openai.com</a>.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="font-size:12px;color:#9ca3af;">TDM Socials — Automatische kredietcontrole</p>
      </div>`;

    try {
      await this.mailService.sendMail({
        to: adminEmail,
        subject: `[TDM Socials] Laag tegoed: ${lowBalances.map((b) => b.service).join(', ')}`,
        html,
      });
      this.logger.warn(`Low credit alert sent: ${lowBalances.map((b) => `${b.service}: $${b.balance.toFixed(2)}`).join(', ')}`);
    } catch (error) {
      this.logger.error('Failed to send low credit alert', error);
    }
  }

  private async checkFalBalance(): Promise<CreditBalance | null> {
    if (!this.falAdminKey) {
      this.logger.warn('FAL_ADMIN_API_KEY not configured — cannot check Fal.ai balance');
      return null;
    }

    try {
      const response = await fetch('https://api.fal.ai/v1/account/billing?expand=credits', {
        headers: { 'Authorization': `Key ${this.falAdminKey}` },
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.warn(`Fal.ai balance check failed: ${response.status} — ${body}`);
        return null;
      }

      const data = await response.json() as any;
      const balance = data?.credits?.current_balance ?? data?.balance ?? null;

      if (balance === null) {
        this.logger.warn(`Fal.ai balance response unexpected: ${JSON.stringify(data).substring(0, 200)}`);
        return null;
      }

      this.logger.log(`Fal.ai balance: $${balance}`);
      return {
        service: 'Fal.ai (Flux)',
        balance: parseFloat(balance),
        currency: 'USD',
        dashboardUrl: 'https://fal.ai/dashboard/billing',
      };
    } catch (error: any) {
      this.logger.error(`Fal.ai balance check error: ${error?.message}`);
      return null;
    }
  }
}
