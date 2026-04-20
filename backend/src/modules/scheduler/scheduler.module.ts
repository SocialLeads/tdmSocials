import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module';
import { OutgoingCommunicationModule } from '../outgoing-communication/outgoing-communication.module';
import { AiModule } from '../ai/ai.module';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [ContentModule, OutgoingCommunicationModule, AiModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
