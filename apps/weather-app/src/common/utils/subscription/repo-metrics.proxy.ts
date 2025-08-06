import { Metrics } from '../../interfaces/metrics.interface';

export function wrapRepoWithMetrics<T extends object>(
  repo: T,
  metrics: Metrics,
  entity: string,
  source: string,
): T {
  return new Proxy(repo, {
    get(target, prop: string | symbol, receiver: unknown): unknown {
      const original = Reflect.get(target, prop, receiver);

      if (typeof original !== 'function') {
        return original;
      }

      return async (...args: unknown[]): Promise<unknown> => {
        const operation = String(prop);
        const timer = metrics.dbCallDuration
          .labels(operation, entity, source)
          .startTimer();

        try {
          const result = await original.apply(target, args);
          metrics.dbCallsCounter.labels(operation, entity, source).inc();
          return result;
        } catch (error: unknown) {
          metrics.logger?.error({
            message: 'Error in repository call',
            method: operation,
            error,
          });
          throw error;
        } finally {
          timer();
        }
      };
    },
  });
}
