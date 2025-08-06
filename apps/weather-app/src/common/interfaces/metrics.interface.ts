import { Counter, Histogram } from 'prom-client';
import { Logger } from '@nestjs/common';

export interface Metrics {
  logger: Logger;
  dbCallDuration: Histogram;
  dbCallsCounter: Counter;

  trackCacheRequest(result: 'hit' | 'miss'): void;
  trackApiCall(): void;
  trackDbOperation<T>(
    operation: string,
    entity: string,
    source: string,
    dbCall: () => Promise<T>,
  ): Promise<T>;
}
