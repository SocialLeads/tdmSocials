import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module';
import { AiModule } from '../ai/ai.module';
import { OutgoingCommunicationModule } from '../outgoing-communication/outgoing-communication.module';
import { ContentComposerService } from './content-composer.service';
import { ContentProcessorService } from './content-processor.service';

@Module({
  imports: [ClientsModule, AiModule, OutgoingCommunicationModule],
  providers: [ContentComposerService, ContentProcessorService],
  exports: [ContentProcessorService],
})
export class ContentModule {}
