import { Injectable, Logger } from '@nestjs/common';
import { Counter, collectDefaultMetrics } from 'prom-client';

import { Metrics } from '../../interfaces/metrics.interface';

@Injectable()
export class MetricsService implements Metrics {
  private readonly logger = new Logger(MetricsService.name);

  private mailCounter: Counter;

  constructor() {
    collectDefaultMetrics();

    this.mailCounter = new Counter({
      name: 'mail_requests',
      help: 'Total number of mail requests',
      labelNames: ['type'],
    });
  }

  public trackMailRequest(type: 'confirm' | 'weather'): void {
    try {
      this.mailCounter.labels(type).inc();
    } catch (error) {
      this.logger.error({
        type,
        message: 'Error recording mail requests metric',
        error,
      });
    }
  }
}
