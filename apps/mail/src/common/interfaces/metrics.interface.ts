export interface Metrics {
  trackMailRequest(result: 'confirm' | 'weather'): void;
}
