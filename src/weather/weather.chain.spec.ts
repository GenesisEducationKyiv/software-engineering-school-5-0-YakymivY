import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { WeatherChain } from './weather.chain';
import { WeatherApiHandler } from './handlers/weather-api.handler';
import { OpenWeatherMapHandler } from './handlers/openweathermap.handler';

describe('WeatherChain', () => {
  let primaryHandler: WeatherApiHandler;
  let secondaryHandler: OpenWeatherMapHandler;
  let weatherChain: WeatherChain;

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
      ],
    }).compile();

    primaryHandler = module.get(WeatherApiHandler);
    secondaryHandler = module.get(OpenWeatherMapHandler);
    weatherChain = module.get(WeatherChain);

    weatherChain.onModuleInit(); // sets the chain
  });

  it('should return from primary if it succeeds', async () => {
    jest.spyOn(primaryHandler as any, 'fetch').mockResolvedValue(mockWeather);

    const result = await weatherChain.handler.getCurrentWeather('Kyiv');

    expect(result).toEqual(mockWeather);
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
