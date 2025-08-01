export interface Metrics {
  trackCacheRequest(result: 'hit' | 'miss'): void;
  trackApiCall(): void;
  trackDbOperation<T>(
    operation: string,
    entity: string,
    source: string,
    dbCall: () => Promise<T>,
  ): Promise<T>;
}
