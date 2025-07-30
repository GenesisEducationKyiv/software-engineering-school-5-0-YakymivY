import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { WeatherApiHandler } from '../external-services/weatherapi/weather-api.handler';
import { OpenWeatherMapHandler } from '../external-services/openweathermap/openweathermap.handler';
import { Caching } from '../../../common/interfaces/caching.interface';
import { Metrics } from '../../../common/interfaces/metrics.interface';

import { WeatherChain } from './weather.chain';

describe('WeatherChain', () => {
  let primaryHandler: WeatherApiHandler;
  let secondaryHandler: OpenWeatherMapHandler;
  let weatherChain: WeatherChain;
  let cachingService: Caching;
  let metricsService: Metrics;

  const mockWeather = {
    temperature: 25,
    humidity: 60,
    description: 'Clear',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherChain,
        WeatherApiHandler,
        OpenWeatherMapHandler,
        {
          provide: HttpService,
          useValue: { get: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('dummy_key'),
          },
        },
        {
          provide: 'CachingService',
          useValue: { get: jest.fn(), set: jest.fn() },
        },
        {
          provide: 'MetricsService',
          useValue: { trackCacheRequest: jest.fn() },
        },
      ],
    }).compile();

    primaryHandler = module.get(WeatherApiHandler);
    secondaryHandler = module.get(OpenWeatherMapHandler);
    weatherChain = module.get(WeatherChain);
    cachingService = module.get('CachingService');
    metricsService = module.get('MetricsService');

    weatherChain.onModuleInit(); // sets the chain
  });

  it('should return from primary if it succeeds', async () => {
    jest.spyOn(primaryHandler as any, 'fetch').mockResolvedValue(mockWeather);

    const result = await weatherChain.handler.getCurrentWeather('Kyiv');

    expect(result).toEqual(mockWeather);
    expect(cachingService.get).toHaveBeenCalledWith('weather:kyiv');
    expect(metricsService.trackCacheRequest).toHaveBeenCalledWith('miss');
  });

  it('should fall back to secondary if primary fails', async () => {
    jest
      .spyOn(primaryHandler as any, 'fetch')
      .mockRejectedValueOnce(new Error('Primary failed'));
    jest
      .spyOn(secondaryHandler as any, 'fetch')
      .mockResolvedValueOnce(mockWeather);

    const result = await weatherChain.handler.getCurrentWeather('Lviv');

    expect(result).toEqual(mockWeather);
    expect(cachingService.get).toHaveBeenCalledWith('weather:lviv');
    expect(metricsService.trackCacheRequest).toHaveBeenCalledWith('miss');
  });

  it('should throw if both fail', async () => {
    jest
      .spyOn(primaryHandler as any, 'fetch')
      .mockRejectedValueOnce(new Error('Primary failed'));
    jest
      .spyOn(secondaryHandler as any, 'fetch')
      .mockRejectedValueOnce(new Error('Secondary failed'));

    await expect(
      weatherChain.handler.getCurrentWeather('InvalidCity'),
    ).rejects.toThrow('Secondary failed');
  });
});
