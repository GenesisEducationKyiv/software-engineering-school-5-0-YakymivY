import { HandlerResponse } from '../interfaces/weather.interface';
import { CachingService } from '../../common/services/caching.service';
import { WeatherProvider } from '../interfaces/weather-provider.interface';
import { MetricsService } from '../../common/services/metrics.service';

import { CachingResponseDecorator } from './caching-response.decorator';

describe('CachingResponseDecorator', () => {
  let decorator: CachingResponseDecorator;
  let weatherProviderMock: jest.Mocked<WeatherProvider>;
  let cachingServiceMock: jest.Mocked<CachingService>;
  let metricsServiceMock: jest.Mocked<MetricsService>;

  const city = 'Kyiv';
  const cacheKey = `weather:${city.toLowerCase()}`;
  const weatherData: HandlerResponse = {
    provider: 'MockProvider',
    weather: {
      temperature: 20,
      humidity: 60,
      description: 'clear',
    },
  };

  beforeEach(() => {
    weatherProviderMock = {
      getCurrentWeather: jest.fn(),
      getProviderName: jest.fn(() => 'MockProvider'),
      setNext: jest.fn(),
    };

    cachingServiceMock = {
      get: jest.fn(),
      set: jest.fn(),
    } as any;

    metricsServiceMock = {
      trackCacheRequest: jest.fn(),
    } as any;

    decorator = new CachingResponseDecorator(
      weatherProviderMock,
      cachingServiceMock,
      metricsServiceMock,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should return cached response if available', async () => {
    cachingServiceMock.get.mockResolvedValueOnce(weatherData);

    const result = await decorator.getCurrentWeather(city);

    expect(cachingServiceMock.get).toHaveBeenCalledWith(cacheKey);
    expect(weatherProviderMock.getCurrentWeather).not.toHaveBeenCalled();
    expect(metricsServiceMock.trackCacheRequest).toHaveBeenCalledWith('hit');
    expect(result).toEqual(weatherData);
  });

  it('should fetch from provider and cache the result if not cached', async () => {
    cachingServiceMock.get.mockResolvedValueOnce(null);
    weatherProviderMock.getCurrentWeather.mockResolvedValueOnce(weatherData);

    const result = await decorator.getCurrentWeather(city);

    expect(cachingServiceMock.get).toHaveBeenCalledWith(cacheKey);
    expect(weatherProviderMock.getCurrentWeather).toHaveBeenCalledWith(city);
    expect(cachingServiceMock.set).toHaveBeenCalledWith(
      cacheKey,
      weatherData,
      180,
    );
    expect(metricsServiceMock.trackCacheRequest).toHaveBeenCalledWith('miss');
    expect(result).toEqual(weatherData);
  });

  it('should call getProviderName()', () => {
    const name = decorator.getProviderName();
    expect(name).toBe('MockProvider');
    expect(weatherProviderMock.getProviderName).toHaveBeenCalled();
  });

  it('should delegate setNext() to the wrapped provider', () => {
    const nextMock = {} as WeatherProvider;
    const result = decorator.setNext(nextMock);

    expect(weatherProviderMock.setNext).toHaveBeenCalledWith(nextMock);
    expect(result).toBe(decorator);
  });
});
