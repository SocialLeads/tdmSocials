import { DataSource, EntityManager } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';

/**
 * Transaction utility for wrapping operations in database transactions.
 * Ensures all-or-nothing semantics for multi-step operations.
 */
@Injectable()
export class TransactionHelper {
  private readonly logger = new Logger(TransactionHelper.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Execute a function within a database transaction.
   * If the function throws, the transaction is rolled back.
   * 
   * @param fn - Function to execute within the transaction
   * @returns The result of the function
   */
  async withTransaction<T>(
    fn: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await fn(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Transaction rolled back due to error:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

