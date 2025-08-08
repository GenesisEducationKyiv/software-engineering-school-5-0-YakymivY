import { Injectable } from '@nestjs/common';
import { Counter } from 'prom-client';

import { consoleLogger } from '@app/common';

import { Metrics } from '../interfaces/metrics.interface';

@Injectable()
export class MetricsService implements Metrics {
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
      consoleLogger.error('Error recording metric:', error);
    }
  }
}
