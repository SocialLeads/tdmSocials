import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InvoiceService } from './invoice.service';
import { GenerateInvoiceDto } from './invoice.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/auth.decorators';

@ApiTags('Invoices')
@ApiBearerAuth()
@Controller('invoices')
@UseGuards(RolesGuard)
@Roles('ADMIN')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate invoice PDF' })
  async generate(@Body() dto: GenerateInvoiceDto, @Res() res: Response): Promise<void> {
    const pdfBuffer = await this.invoiceService.generatePdf(dto);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${dto.invoiceNumber}.pdf`,
      'Content-Length': pdfBuffer.length.toString(),
    });

    res.end(pdfBuffer);
  }
}
