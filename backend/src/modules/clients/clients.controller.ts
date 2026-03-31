import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './clients.dto';
import { ClientEntity } from './client.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/auth.decorators';

@ApiTags('Clients')
@ApiBearerAuth()
@Controller('clients')
@UseGuards(RolesGuard)
@Roles('ADMIN')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOkResponse({ type: ClientEntity, isArray: true })
  async findAll(): Promise<ClientEntity[]> {
    return this.clientsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ClientEntity })
  async findById(@Param('id') id: string): Promise<ClientEntity> {
    return this.clientsService.findById(id);
  }

  @Post()
  @ApiCreatedResponse({ type: ClientEntity })
  async create(@Body() dto: CreateClientDto): Promise<ClientEntity> {
    return this.clientsService.create(dto);
  }

  @Put(':id')
  @ApiOkResponse({ type: ClientEntity })
  async update(@Param('id') id: string, @Body() dto: UpdateClientDto): Promise<ClientEntity> {
    return this.clientsService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.clientsService.delete(id);
    return { message: `Client ${id} deleted` };
  }
}
