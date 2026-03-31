import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export type MailPayload = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;
  private readonly defaultFrom: string | null;
  private readonly hasAuth: boolean;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST', 'smtp.privateemail.com');
    const port = Number(this.configService.get<string>('SMTP_PORT', '465'));
    const secureRaw = this.configService.get<string>('SMTP_SECURE', 'true');
    const user = this.configService.get<string>('SMTP_USER', '');
    const pass = this.configService.get<string>('SMTP_PASS', '');
    const fromEmail = this.configService.get<string>('SMTP_FROM', user);
    const fromName = this.configService.get<string>('SMTP_FROM_NAME', 'TDM Socials');

    this.defaultFrom = fromEmail
      ? fromName
        ? `"${fromName}" <${fromEmail}>`
        : fromEmail
      : null;

    this.hasAuth = Boolean(user && pass);
    if (!this.hasAuth) {
      this.logger.warn('SMTP credentials are not configured. Emails will fail to send.');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: secureRaw === 'true' || secureRaw === '1',
      auth: this.hasAuth ? { user, pass } : undefined,
    });
  }

  async sendMail(payload: MailPayload) {
    const from = payload.from ?? this.defaultFrom;
    if (!from) {
      throw new Error('SMTP_FROM is not configured');
    }
    if (!this.hasAuth) {
      throw new Error('SMTP credentials are not configured');
    }

    const info = await this.transporter.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
      replyTo: payload.replyTo,
    });

    this.logger.log('Mail sent', {
      messageId: info.messageId,
      to: payload.to,
      subject: payload.subject,
    });

    return info;
  }
}
