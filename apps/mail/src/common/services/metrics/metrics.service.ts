import { Injectable, Logger } from '@nestjs/common';
import { Counter } from 'prom-client';
import * as Prometheus from 'prom-client';

import { Metrics } from '../../interfaces/metrics.interface';

@Injectable()
export class MetricsService implements Metrics {
  private readonly logger = new Logger(MetricsService.name);

  private mailCounter: Counter;

  constructor() {
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

  public async getMetrics(): Promise<string> {
    try {
      return await Prometheus.register.metrics();
    } catch (error) {
      this.logger.error({
        message: 'Error collecting metrics',
        error: error.message,
      });
      throw new Error('Failed to collect metrics');
    }
  }
}
