import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { FluxService } from './flux.service';
import { ImageStorageService } from './image-storage.service';

@Module({
  imports: [ConfigModule],
  providers: [AiService, FluxService, ImageStorageService],
  exports: [AiService, FluxService, ImageStorageService],
})
export class AiModule {}
