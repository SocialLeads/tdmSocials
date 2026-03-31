import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ClientsRepository } from './clients.repository';
import { ClientEntity } from './client.entity';
import { CreateClientDto, UpdateClientDto } from './clients.dto';
import { Industry } from './client.types';

@Injectable()
export class ClientsService {
  constructor(private readonly repo: ClientsRepository) {}

  async findAll(): Promise<ClientEntity[]> {
    return this.repo.findAll();
  }

  async findById(id: string): Promise<ClientEntity> {
    const client = await this.repo.findById(id);
    if (!client) throw new NotFoundException(`Client ${id} not found`);
    return client;
  }

  async create(dto: CreateClientDto): Promise<ClientEntity> {
    const existing = await this.repo.findByEmail(dto.email);
    if (existing) throw new BadRequestException(`Email '${dto.email}' is already in use`);
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateClientDto): Promise<ClientEntity> {
    const client = await this.findById(id);
    if (dto.email && dto.email !== client.email) {
      const existing = await this.repo.findByEmail(dto.email);
      if (existing) throw new BadRequestException(`Email '${dto.email}' is already in use`);
    }
    const updated = await this.repo.update(id, dto);
    if (!updated) throw new NotFoundException(`Client ${id} not found`);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.repo.delete(id);
  }

  async getUniqueIndustries(): Promise<Industry[]> {
    return this.repo.getUniqueIndustries();
  }

  async findByIndustry(industry: Industry): Promise<ClientEntity[]> {
    return this.repo.findByIndustry(industry);
  }

  async incrementEmailCounters(clientIds: string[]): Promise<void> {
    return this.repo.incrementEmailCounters(clientIds);
  }

  async resetInvoiceCounter(clientId: string): Promise<void> {
    return this.repo.resetInvoiceCounter(clientId, new Date());
  }
}
