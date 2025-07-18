import { Test, TestingModule } from '@nestjs/testing';

import { WeatherResponse } from '../../domain/entities/weather.interface';
import { WeatherApi } from '../../domain/interfaces/weather-api.interface';

import { WeatherController } from './weather.controller';

describe('WeatherController', () => {
  let controller: WeatherController;
  let weatherService: WeatherApi;

  const mockWeatherService = {
    getCurrentWeather: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        {
          provide: 'WeatherApi',
          useValue: mockWeatherService,
        },
      ],
    }).compile();

    controller = module.get<WeatherController>(WeatherController);
    weatherService = module.get('WeatherApi');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getWeather', () => {
    it('should return weather response for a valid city', async () => {
      const mockCityDto = { city: 'London' };
      const mockWeather: WeatherResponse = {
        temperature: 15,
        humidity: 70,
        description: 'Cloudy',
      };

      jest
        .spyOn(weatherService, 'getCurrentWeather')
        .mockResolvedValue(mockWeather);

      const result = await controller.getWeather(mockCityDto);

      expect(weatherService.getCurrentWeather).toHaveBeenCalledWith('London');
      expect(result).toEqual(mockWeather);
    });
  });
});
