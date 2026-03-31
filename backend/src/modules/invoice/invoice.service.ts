import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { InvoiceTemplateService } from './invoice-template.service';
import { ClientsService } from '../clients/clients.service';
import { InvoiceData } from './invoice.types';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private readonly templateService: InvoiceTemplateService,
    private readonly clientsService: ClientsService,
  ) {}

  async generatePdf(data: InvoiceData): Promise<Buffer> {
    const html = this.templateService.generateHtml(data);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      });

      // Reset the client's invoice counter
      await this.clientsService.resetInvoiceCounter(data.clientId);

      this.logger.log(`Invoice PDF generated for ${data.clientName} (${data.invoiceNumber})`);
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
}
