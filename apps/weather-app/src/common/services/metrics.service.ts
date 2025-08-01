import { Injectable, Logger } from '@nestjs/common';
import { Counter } from 'prom-client';

import { Metrics } from '../interfaces/metrics.interface';

@Injectable()
export class MetricsService implements Metrics {
  private readonly logger = new Logger(MetricsService.name);

  private counter: Counter;

  constructor() {
    this.counter = new Counter({
      name: 'cache_requests',
      help: 'Total number of cache requests',
      labelNames: ['result'],
    });
  }

  public trackCacheRequest(result: 'hit' | 'miss'): void {
    try {
      this.counter.labels(result).inc();
    } catch (error) {
      this.logger.error({
        result,
        message: 'Error recording metric',
        error,
      });
    }
  }
}
