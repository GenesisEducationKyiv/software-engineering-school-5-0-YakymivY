import { Test, TestingModule } from '@nestjs/testing';

import { WeatherChain } from '../weather.chain';
import { HandlerResponse } from '../interfaces/weather.interface';

import { WeatherService } from './weather.service';

describe('WeatherService', () => {
  let service: WeatherService;
  let weatherChain: { handler: { getCurrentWeather: jest.Mock } };

  beforeEach(async () => {
    weatherChain = {
      handler: {
        getCurrentWeather: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: WeatherChain,
          useValue: weatherChain,
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return current weather from chain handler', async () => {
    const city = 'Kyiv';
    const mockWeather: HandlerResponse = {
      provider: 'weatherapi.com',
      weather: {
        temperature: 22,
        humidity: 55,
        description: 'Sunny',
      },
    };

    weatherChain.handler.getCurrentWeather.mockResolvedValueOnce(mockWeather);

    const result = await service.getCurrentWeather(city);

    expect(weatherChain.handler.getCurrentWeather).toHaveBeenCalledWith(city);
    expect(result).toEqual(mockWeather.weather);
  });

  it('should propagate error if handler throws', async () => {
    const city = 'Unknown';
    const error = new Error('City not found');

    weatherChain.handler.getCurrentWeather.mockRejectedValueOnce(error);

    await expect(service.getCurrentWeather(city)).rejects.toThrow(
      'City not found',
    );
  });
});
