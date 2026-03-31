import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ClientEntity } from './client.entity';
import { CreateClientDto } from './clients.dto';
import { Industry } from './client.types';

@Injectable()
export class ClientsRepository {
  private readonly logger = new Logger(ClientsRepository.name);

  constructor(
    @InjectRepository(ClientEntity)
    private readonly repo: Repository<ClientEntity>,
  ) {}

  async findAll(): Promise<ClientEntity[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<ClientEntity | null> {
    return this.repo.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<ClientEntity | null> {
    return this.repo.findOneBy({ email });
  }

  async create(data: CreateClientDto): Promise<ClientEntity> {
    const client = this.repo.create(data);
    return this.repo.save(client);
  }

  async update(id: string, data: Partial<ClientEntity>): Promise<ClientEntity | null> {
    await this.repo.update(id, data);
    return this.repo.findOneBy({ id });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async getUniqueIndustries(): Promise<Industry[]> {
    const result = await this.repo
      .createQueryBuilder('client')
      .select('DISTINCT client.industry', 'industry')
      .getRawMany();
    return result.map((r) => r.industry as Industry);
  }

  async findByIndustry(industry: Industry): Promise<ClientEntity[]> {
    return this.repo.find({ where: { industry } });
  }

  async incrementEmailCounters(clientIds: string[]): Promise<void> {
    if (clientIds.length === 0) return;
    await this.repo
      .createQueryBuilder()
      .update(ClientEntity)
      .set({
        totalEmailsSent: () => '"totalEmailsSent" + 1',
        emailsSinceLastInvoice: () => '"emailsSinceLastInvoice" + 1',
      })
      .where({ id: In(clientIds) })
      .execute();
  }

  async resetInvoiceCounter(clientId: string, invoiceDate: Date): Promise<void> {
    await this.repo.update(clientId, {
      emailsSinceLastInvoice: 0,
      lastInvoiceDate: invoiceDate,
    });
  }
}
