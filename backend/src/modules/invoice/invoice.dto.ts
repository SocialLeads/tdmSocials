import { IsString, IsNumber, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class InvoiceLineItemDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Social Media Content Emails' })
  description: string;

  @IsNumber()
  @ApiProperty({ example: 30 })
  quantity: number;

  @IsNumber()
  @ApiProperty({ example: 5.0 })
  unitPrice: number;

  @IsNumber()
  @ApiProperty({ example: 150.0 })
  total: number;
}

export class GenerateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'uuid-here' })
  clientId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Acme Corp' })
  clientName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'contact@acme.com' })
  clientEmail: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  @ApiProperty({ type: [InvoiceLineItemDto] })
  lineItems: InvoiceLineItemDto[];

  @IsNumber()
  @ApiProperty({ example: 150.0 })
  subtotal: number;

  @IsNumber()
  @ApiProperty({ example: 21 })
  btwPercentage: number;

  @IsNumber()
  @ApiProperty({ example: 31.5 })
  btwAmount: number;

  @IsNumber()
  @ApiProperty({ example: 181.5 })
  grandTotal: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '2026-03-31' })
  invoiceDate: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'INV-001' })
  invoiceNumber: string;

  @IsString()
  @ApiProperty({ example: '12345678' })
  kvkNumber: string;

  @IsString()
  @ApiProperty({ example: 'NL123456789B01' })
  btwId: string;

  @IsString()
  @ApiProperty({ example: 'NL00BANK0123456789' })
  iban: string;
}
