import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

import { Caching } from '../interfaces/caching.interface';

@Injectable()
export class CachingService implements Caching {
  private readonly logger = new Logger(CachingService.name);

  constructor(@InjectRedis() private readonly redis: Redis) {}

  public async get<T>(key: string): Promise<T | null> {
    try {
      const cachedResponse = await this.redis.get(key);
      if (cachedResponse) {
        return JSON.parse(cachedResponse) as T;
      }
      return null;
    } catch (error) {
      this.logger.error({
        key,
        message: 'Error getting cache',
        error,
      });
      return null;
    }
  }

  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error) {
      this.logger.error({
        key,
        message: 'Error setting cache',
        error,
      });
    }
  }
}
