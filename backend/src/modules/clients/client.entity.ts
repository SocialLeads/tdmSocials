import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Industry } from './client.types';

@Entity('clients')
export class ClientEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  @Index()
  email!: string;

  @Column({ type: 'enum', enum: Industry })
  industry!: Industry;

  @Column({ type: 'int', default: 0 })
  totalEmailsSent!: number;

  @Column({ type: 'int', default: 0 })
  emailsSinceLastInvoice!: number;

  @Column({ type: 'timestamp', nullable: true })
  lastInvoiceDate?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
