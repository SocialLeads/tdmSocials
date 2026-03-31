import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [ContentModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
