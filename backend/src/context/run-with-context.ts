import { requestContext } from './request-context';
import { randomUUID } from 'crypto';

export function runWithContext<T>(
  context: {
    traceId?: string;
    conversationKey?: string;
    userId?: string;
    channel?: string;
  },
  fn: () => Promise<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    requestContext.run(
      {
        traceId: context.traceId ?? randomUUID(),
        conversationKey: context.conversationKey,
        channel: context.channel,
        userId: context.userId?.toString(),
      },
      async () => {
        try {
          resolve(await fn());
        } catch (e) {
          reject(e);
        }
      },
    );
  });
}
