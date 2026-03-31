import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ContentProcessorService } from '../content/content-processor.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly contentProcessor: ContentProcessorService,
    private readonly configService: ConfigService,
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
    }
  }
}
