import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { FluxService } from './flux.service';
import { ImageStorageService } from './image-storage.service';
import { CreditMonitorService } from './credit-monitor.service';
import { OutgoingCommunicationModule } from '../outgoing-communication/outgoing-communication.module';

@Module({
  imports: [ConfigModule, OutgoingCommunicationModule],
  providers: [AiService, FluxService, ImageStorageService, CreditMonitorService],
  exports: [AiService, FluxService, ImageStorageService, CreditMonitorService],
})
export class AiModule {}
