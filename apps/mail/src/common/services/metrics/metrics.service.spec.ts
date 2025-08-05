import { Test, TestingModule } from '@nestjs/testing';
import { Counter } from 'prom-client';

import { MetricsService } from './metrics.service';

jest.mock('prom-client', () => {
  const labels = jest.fn().mockReturnThis();
  const inc = jest.fn();
  const CounterMock = jest.fn(() => ({
    labels,
    inc,
  }));
  return { Counter: CounterMock };
});

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetricsService],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should increment counter for "confirm"', () => {
    service.trackMailRequest('confirm');
    const counterInstance = (Counter as jest.Mock).mock.results[0].value;
    expect(counterInstance.labels).toHaveBeenCalledWith('confirm');
    expect(counterInstance.inc).toHaveBeenCalled();
  });

  it('should increment counter for "weather"', () => {
    service.trackMailRequest('weather');
    const counterInstance = (Counter as jest.Mock).mock.results[0].value;
    expect(counterInstance.labels).toHaveBeenCalledWith('weather');
    expect(counterInstance.inc).toHaveBeenCalled();
  });

  it('should handle exception from prom-client gracefully', () => {
    const counterInstance = (Counter as jest.Mock).mock.results[0].value;
    (counterInstance.labels as jest.Mock).mockImplementation(() => {
      throw new Error('Fake error');
    });

    expect(() => service.trackMailRequest('confirm')).not.toThrow();
  });
});
