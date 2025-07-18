import { Counter } from 'prom-client';

import { consoleLogger } from '@app/common';

import { MetricsService } from './metrics.service';

jest.mock('prom-client');
jest.mock('@app/common', () => ({
  consoleLogger: {
    error: jest.fn(),
  },
}));

describe('MetricsService', () => {
  let service: MetricsService;
  let labelsMock: { inc: jest.Mock };

  beforeEach(() => {
    labelsMock = { inc: jest.fn() };

    // Mock the Counter constructor to return a mock object with .labels()
    (Counter as jest.Mock).mockImplementation(() => ({
      labels: jest.fn(() => labelsMock),
    }));

    service = new MetricsService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should increment the hit label', () => {
    service.trackCacheRequest('hit');

    expect(Counter).toHaveBeenCalledWith({
      name: 'cache_requests',
      help: 'Total number of cache requests',
      labelNames: ['result'],
    });

    expect(labelsMock.inc).toHaveBeenCalled();
    expect(
      (Counter as jest.Mock).mock.results[0].value.labels,
    ).toHaveBeenCalledWith('hit');
  });

  it('should increment the miss label', () => {
    service.trackCacheRequest('miss');

    expect(labelsMock.inc).toHaveBeenCalled();
    expect(
      (Counter as jest.Mock).mock.results[0].value.labels,
    ).toHaveBeenCalledWith('miss');
  });

  it('should catch and log error if labels throw', () => {
    const error = new Error('Invalid label');
    (Counter as jest.Mock).mockReturnValueOnce({
      labels: jest.fn(() => {
        throw error;
      }),
    });

    const failingService = new MetricsService();
    failingService.trackCacheRequest('hit');

    expect(consoleLogger.error).toHaveBeenCalledWith(
      'Error recording metric:',
      error,
    );
  });
});
