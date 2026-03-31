import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module';
import { InvoiceService } from './invoice.service';
import { InvoiceTemplateService } from './invoice-template.service';
import { InvoiceController } from './invoice.controller';

@Module({
  imports: [ClientsModule],
  controllers: [InvoiceController],
  providers: [InvoiceService, InvoiceTemplateService],
})
export class InvoiceModule {}
