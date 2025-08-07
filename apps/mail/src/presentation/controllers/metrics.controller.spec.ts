import { Test, TestingModule } from '@nestjs/testing';

import { MetricsGuard } from '@app/common';

import { Metrics } from '../../common/interfaces/metrics.interface';

import { MetricsController } from './metrics.controller';

describe('MetricsController', () => {
  let controller: MetricsController;
  let metricsService: Metrics;

  const mockMetricsService: Metrics = {
    getMetrics: jest.fn(),
    trackMailRequest: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {
          provide: 'MetricsService',
          useValue: mockMetricsService,
        },
      ],
    })
      .overrideGuard(MetricsGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = module.get<MetricsController>(MetricsController);
    metricsService = module.get<Metrics>('MetricsService');
  });

  it('should return metrics string from the service', async () => {
    const fakeMetrics =
      '# HELP some_metric some help\n# TYPE some_metric counter\nsome_metric 1\n';
    jest.spyOn(metricsService, 'getMetrics').mockResolvedValue(fakeMetrics);

    const result = await controller.getMetrics();

    expect(metricsService.getMetrics).toHaveBeenCalled();
    expect(result).toBe(fakeMetrics);
  });
});
