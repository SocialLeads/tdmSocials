import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { randomBytes } from 'crypto';

@Injectable()
export class ImageStorageService {
  private readonly logger = new Logger(ImageStorageService.name);
  private readonly imageDir: string;
  private readonly publicBaseUrl: string;
  private readonly retentionDays: number;

  constructor(private readonly configService: ConfigService) {
    this.imageDir = this.configService.get<string>('app.imageStoragePath', '/app/public/generated');
    this.publicBaseUrl = this.configService.get<string>('app.publicImageBaseUrl', '');
    this.retentionDays = parseInt(this.configService.get<string>('app.imageRetentionDays', '365'), 10);

    // Ensure directory exists
    if (!fs.existsSync(this.imageDir)) {
      fs.mkdirSync(this.imageDir, { recursive: true });
      this.logger.log(`Created image storage directory: ${this.imageDir}`);
    }
  }

  generateFilename(industry: string, platform: string): string {
    const date = new Date().toISOString().split('T')[0];
    const slug = industry.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const platSlug = platform.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const id = randomBytes(4).toString('hex');
    return `${date}_${slug}_${platSlug}_${id}.png`;
  }

  async saveImageFromUrl(tempUrl: string, filename: string): Promise<string> {
    const filePath = path.join(this.imageDir, filename);

    const response = await fetch(tempUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return this.saveBuffer(buffer, filename);
  }

  async saveImageFromBuffer(buffer: Buffer, filename: string): Promise<string> {
    return this.saveBuffer(buffer, filename);
  }

  private saveBuffer(buffer: Buffer, filename: string): string {
    // Reject blank/black images from safety filter (typically under 15KB)
    if (buffer.length < 15_000) {
      this.logger.warn(`Image too small (${(buffer.length / 1024).toFixed(0)} KB), likely blank/safety-filtered — discarding: ${filename}`);
      return '';
    }

    const filePath = path.join(this.imageDir, filename);
    fs.writeFileSync(filePath, buffer);

    this.logger.log(`Image saved: ${filename} (${(buffer.length / 1024).toFixed(0)} KB)`);
    return this.getPublicUrl(filename);
  }

  getPublicUrl(filename: string): string {
    return `${this.publicBaseUrl}/${filename}`;
  }

  async cleanupOlderThan(days?: number): Promise<number> {
    const retention = days ?? this.retentionDays;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retention);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    let deleted = 0;

    if (!fs.existsSync(this.imageDir)) return 0;

    const files = fs.readdirSync(this.imageDir);
    for (const file of files) {
      if (!file.endsWith('.png')) continue;

      // Extract date from filename: 2026-04-11_industry_platform_id.png
      const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})_/);
      if (!dateMatch) continue;

      if (dateMatch[1] < cutoffStr) {
        fs.unlinkSync(path.join(this.imageDir, file));
        deleted++;
      }
    }

    if (deleted > 0) {
      this.logger.log(`Cleaned up ${deleted} images older than ${retention} days`);
    }

    return deleted;
  }
}
