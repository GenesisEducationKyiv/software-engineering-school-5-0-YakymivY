import { Injectable } from '@nestjs/common';
import { Counter } from 'prom-client';

import { consoleLogger } from '../utils/logger/logger.console';

@Injectable()
export class MetricsService {
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
