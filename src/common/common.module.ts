import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';

import { CachingService } from './services/caching.service';
import { MetricsService } from './services/metrics.service';

@Module({
  imports: [
    RedisModule.forRoot({
      type: 'single',
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    }),
  ],
  providers: [CachingService, MetricsService],
  exports: [CachingService, MetricsService],
})
export class CommonModule {}
