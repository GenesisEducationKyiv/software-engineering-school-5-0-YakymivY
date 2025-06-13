import { Test, TestingModule } from '@nestjs/testing';

import { WeatherService } from '../../weather/services/weather.service';
import { WeatherResponse } from '../../weather/interfaces/weather.interface';

import { WeatherController } from './weather.controller';

describe('WeatherController', () => {
  let controller: WeatherController;
  let weatherService: WeatherService;

  const mockWeatherService = {
    getWeather: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        {
          provide: WeatherService,
          useValue: mockWeatherService,
        },
      ],
    }).compile();

    controller = module.get<WeatherController>(WeatherController);
    weatherService = module.get<WeatherService>(WeatherService);
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

      jest.spyOn(weatherService, 'getWeather').mockResolvedValue(mockWeather);

      const result = await controller.getWeather(mockCityDto);

      expect(weatherService.getWeather).toHaveBeenCalledWith('London');
      expect(result).toEqual(mockWeather);
    });
  });
});
