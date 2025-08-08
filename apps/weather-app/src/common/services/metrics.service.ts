import { Injectable, Logger } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';
import * as Prometheus from 'prom-client';

import { Metrics } from '../interfaces/metrics.interface';

@Injectable()
export class MetricsService implements Metrics {
  public readonly logger = new Logger(MetricsService.name);

  private cacheCounter: Counter;
  private apiCallsCounter: Counter;
  public dbCallsCounter: Counter;
  public dbCallDuration: Histogram;

  constructor() {
    this.cacheCounter = new Counter({
      name: 'cache_requests',
      help: 'Total number of cache requests',
      labelNames: ['result'],
    });

    this.apiCallsCounter = new Counter({
      name: 'external_api_calls',
      help: 'Total number of external API calls',
    });

    this.dbCallsCounter = new Counter({
      name: 'db_calls_total',
      help: 'Total number of database operations',
      labelNames: ['operation', 'entity', 'source'],
    });

    this.dbCallDuration = new Histogram({
      name: 'db_call_duration_seconds',
      help: 'Duration of database operations in seconds',
      labelNames: ['operation', 'entity', 'source'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
    });
  }

  public trackCacheRequest(result: 'hit' | 'miss'): void {
    try {
      this.cacheCounter.labels(result).inc();
    } catch (error) {
      this.logger.error({
        result,
        message: 'Error recording cache requests metric',
        error,
      });
    }
  }

  public trackApiCall(): void {
    try {
      this.apiCallsCounter.inc();
    } catch (error) {
      this.logger.error({
        message: 'Error recording api calls counter metric',
        error,
      });
    }
  }

  public async trackDbOperation<T>(
    operation: string,
    entity: string,
    source: string,
    dbCall: () => Promise<T>,
  ): Promise<T> {
    const timer = this.dbCallDuration
      .labels(operation, entity, source)
      .startTimer();
    try {
      const result = await dbCall();
      this.dbCallsCounter.labels(operation, entity, source).inc();
      return result;
    } catch (error) {
      this.logger.error({
        message: 'Error recording db calls counter metric',
        error,
      });
    } finally {
      timer();
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
