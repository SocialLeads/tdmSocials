import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Public } from '../auth/guards/auth.decorators';
import { ClientsService } from '../clients/clients.service';
import { MailService } from '../outgoing-communication/mail.service';
import { ContentProcessorService } from '../content/content-processor.service';
import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

class ContactFormDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'I would like to learn more about your service.' })
  message: string;

  // Honeypot field - should always be empty. Bots auto-fill hidden fields.
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  website?: string;
}

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly mailService: MailService,
    private readonly contentProcessor: ContentProcessorService,
    private readonly configService: ConfigService,
  ) {}

  @Get('dashboard')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get dashboard data (all clients with stats)' })
  async getDashboard() {
    const clients = await this.clientsService.findAll();
    return { clients };
  }

  @Post('contact')
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60 } })
  @ApiOperation({ summary: 'Public contact form submission' })
  async submitContactForm(@Body() dto: ContactFormDto) {
    // Honeypot: if the hidden "website" field has a value, it's a bot
    if (dto.website) {
      return { message: 'Message sent successfully' };
    }

    const adminEmail = this.configService.get<string>('app.adminContactEmail');
    if (!adminEmail) {
      return { message: 'Contact form received' };
    }

    await this.mailService.sendMail({
      to: adminEmail,
      subject: `Contact Form: ${escapeHtml(dto.name)}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(dto.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(dto.email)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(dto.message)}</p>
      `,
      replyTo: dto.email,
    });

    return { message: 'Message sent successfully' };
  }

  @Post('trigger-daily-cron')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Manually trigger the daily content email cron' })
  async triggerDailyCron() {
    const result = await this.contentProcessor.processDaily();
    return result;
  }
}
