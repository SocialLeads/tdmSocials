import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

export const CACHE_PREFIX = 'cache';

@Injectable()
export class RedisCacheService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  private hits = 0;
  private misses = 0;

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (value) {
      this.hits++;
      return JSON.parse(value);
    }
    this.misses++;
    return null;
  }

  async set<T>(
    key: string,
    value: T,
    ttlSeconds?: number,
  ): Promise<void> {
    const payload = JSON.stringify(value);
    if (ttlSeconds) {
      await this.redis.set(key, payload, 'EX', ttlSeconds);
    } else {
      await this.redis.set(key, payload);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * Increment a counter and optionally apply a TTL (set on first write).
   * Uses EXPIRE NX so the TTL is only attached when the key is created.
   */
  async increment(key: string, ttlSeconds?: number): Promise<number> {
    const count = await this.redis.incr(key);

    if (ttlSeconds) {
      // Avoid sliding the window on every increment
      await this.redis.expire(key, ttlSeconds, 'NX');
    }

    return count;
  }
}
