import { Module } from '@nestjs/common';

import { MetricsService } from './services/metrics/metrics.service';

@Module({
  providers: [{ provide: 'MetricsService', useClass: MetricsService }],
  exports: ['MetricsService'],
})
export class CommonModule {}
