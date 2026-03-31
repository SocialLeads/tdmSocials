import { Logger } from '@nestjs/common';

/**
 * Retry utility for flaky operations (like API calls)
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  operationName: string = 'Operation',
  logger?: Logger
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (logger) {
        logger.log(`🔄 ${operationName} attempt ${attempt}/${maxRetries}`);
      }
      return await operation();
    } catch (error: any) {
      if (attempt === maxRetries) {
        if (logger) {
          logger.error(`❌ ${operationName} failed after ${maxRetries} attempts:`, error);
        }
        throw error;
      }
      
      if (logger) {
        logger.warn(`⚠️ ${operationName} attempt ${attempt} failed, retrying in ${delay * attempt}ms:`, error.message);
      }
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error(`${operationName} failed after ${maxRetries} attempts`);
}
