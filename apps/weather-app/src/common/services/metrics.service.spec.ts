import { Test, TestingModule } from '@nestjs/testing';
import { Counter, Histogram } from 'prom-client';

import { MetricsService } from './metrics.service';

jest.mock('prom-client');

describe('MetricsService', () => {
  let service: MetricsService;

  let cacheLabelsMock: jest.Mock;
  let apiIncMock: jest.Mock;
  let dbLabelsMock: jest.Mock;
  let dbIncMock: jest.Mock;
  let dbTimerStopMock: jest.Mock;
  let dbTimerStartMock: jest.Mock;

  beforeEach(async () => {
    cacheLabelsMock = jest.fn().mockReturnThis();
    apiIncMock = jest.fn();
    dbLabelsMock = jest.fn().mockReturnThis();
    dbIncMock = jest.fn();
    dbTimerStopMock = jest.fn();
    dbTimerStartMock = jest.fn().mockReturnValue(dbTimerStopMock);

    (Counter as jest.Mock).mockImplementation((opts) => {
      switch (opts.name) {
        case 'cache_requests':
          return { labels: cacheLabelsMock, inc: jest.fn() };
        case 'external_api_calls':
          return { inc: apiIncMock };
        case 'db_calls_total':
          return { labels: dbLabelsMock, inc: dbIncMock };
        default:
          return {};
      }
    });

    (Histogram as jest.Mock).mockImplementation(() => ({
      labels: jest.fn().mockReturnThis(),
      startTimer: dbTimerStartMock,
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [MetricsService],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
  });

  describe('trackCacheRequest', () => {
    it('should increment cache counter for "hit"', () => {
      service.trackCacheRequest('hit');
      expect(cacheLabelsMock).toHaveBeenCalledWith('hit');
    });

    it('should handle exception in cache counter', () => {
      cacheLabelsMock.mockImplementation(() => {
        throw new Error('Cache label error');
      });

      expect(() => service.trackCacheRequest('miss')).not.toThrow();
    });
  });

  describe('trackApiCall', () => {
    it('should increment API call counter', () => {
      service.trackApiCall();
      expect(apiIncMock).toHaveBeenCalled();
    });

    it('should handle exception in API call counter', () => {
      apiIncMock.mockImplementation(() => {
        throw new Error('API inc error');
      });

      expect(() => service.trackApiCall()).not.toThrow();
    });
  });

  describe('trackDbOperation', () => {
    it('should time and increment DB call counter on success', async () => {
      const mockDbCall = jest.fn().mockResolvedValue('result');

      const result = await service.trackDbOperation(
        'find',
        'User',
        'API',
        mockDbCall,
      );

      expect(dbLabelsMock).toHaveBeenCalledWith('find', 'User', 'API');
      expect(dbIncMock).toHaveBeenCalled();
      expect(dbTimerStartMock).toHaveBeenCalled();
      expect(dbTimerStopMock).toHaveBeenCalled();
      expect(result).toBe('result');
    });
  });
});
