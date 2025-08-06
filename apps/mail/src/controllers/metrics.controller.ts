import { Controller, Get, Inject, UseGuards } from '@nestjs/common';

import { MetricsGuard } from '@app/common';

import { Metrics } from '../common/interfaces/metrics.interface';

@Controller('metrics')
export class MetricsController {
  constructor(
    @Inject('MetricsService') private readonly metricsService: Metrics,
  ) {}

  @UseGuards(MetricsGuard)
  @Get()
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}
