import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module';
import { OutgoingCommunicationModule } from '../outgoing-communication/outgoing-communication.module';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [ContentModule, OutgoingCommunicationModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
