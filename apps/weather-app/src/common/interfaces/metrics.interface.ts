export interface Metrics {
  trackCacheRequest(result: 'hit' | 'miss'): void;
}
