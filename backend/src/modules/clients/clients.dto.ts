import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Industry } from './client.types';

export class CreateClientDto {
  @IsString()
  @ApiProperty({ example: 'Acme Corp' })
  name: string;

  @IsEmail()
  @ApiProperty({ example: 'contact@acme.com' })
  email: string;

  @IsEnum(Industry)
  @ApiProperty({ example: Industry.TECHNOLOGY, enum: Industry })
  industry: Industry;
}

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Acme Corp Updated', required: false })
  name?: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({ example: 'new@acme.com', required: false })
  email?: string;

  @IsOptional()
  @IsEnum(Industry)
  @ApiProperty({ example: Industry.FINANCE, enum: Industry, required: false })
  industry?: Industry;
}
