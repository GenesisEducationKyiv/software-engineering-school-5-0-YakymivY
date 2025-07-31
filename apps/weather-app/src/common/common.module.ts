import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CachingService } from './services/caching.service';
import { MetricsService } from './services/metrics.service';

@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'single',
          url: `redis://${configService.get<string>('REDIS_HOST')}:${configService.get<number>('REDIS_PORT')}/${configService.get<number>('REDIS_DB')}`,
          options: {
            password: configService.get<string>('REDIS_PASS'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    { provide: 'CachingService', useClass: CachingService },
    { provide: 'MetricsService', useClass: MetricsService },
  ],
  exports: ['CachingService', 'MetricsService'],
})
export class CommonModule {}
