import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { WeatherApi } from '../interfaces/weather-api.interface';
import { WeatherResponse } from '../interfaces/weather.interface';
import { formEmailContent } from '../utils/weather.utils';

import { WeatherService } from './weather.service';

describe('WeatherService', () => {
  let httpService: HttpService;
  let weatherService: WeatherApi;

  beforeEach(async () => {
    const mockConfigService = {
      getOrThrow: jest.fn().mockReturnValue('testkey'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: HttpService,
          useValue: { get: jest.fn() },
        },
        {
          provide: 'WeatherApi',
          useClass: WeatherService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    httpService = module.get<HttpService>(HttpService);
    weatherService = module.get<WeatherApi>('WeatherApi');
  });

  describe('getCurrentWeather', () => {
    it('should return formatted weather data on success', async () => {
      const responseData: AxiosResponse = {
        data: {
          current: {
            temp_c: 25,
            humidity: 55,
            condition: { text: 'Partly cloudy' },
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
          method: 'get',
          url: '',
          transformRequest: [],
          transformResponse: [],
          timeout: 0,
        } as InternalAxiosRequestConfig,
      };
      jest.spyOn(httpService, 'get').mockReturnValue(of(responseData));

      const result = await weatherService.getCurrentWeather('TestCity');

      expect(httpService.get).toHaveBeenCalledWith(
        `https://api.weatherapi.com/v1/current.json?q=TestCity&key=testkey`,
      );
      expect(result).toEqual({
        temperature: 25,
        humidity: 55,
        description: 'Partly cloudy',
      });
    });

    it('should throw NotFoundException if city not found (code 1006)', async () => {
      const errorResponse = {
        response: { data: { error: { code: 1006 } } },
      };
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => errorResponse));

      await expect(
        weatherService.getCurrentWeather('UnknownCity'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on other errors', async () => {
      const errorResponse = {
        response: { data: { error: { code: 1234 } } },
      };
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => errorResponse));

      await expect(weatherService.getCurrentWeather('BadCity')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('formEmailContent', () => {
    it('should format the email content with weather info and unsubscribe link', () => {
      process.env.BASE_URL = 'http://localhost:3000/api';
      const weather: WeatherResponse = {
        temperature: 10,
        humidity: 20,
        description: 'Rainy',
      };
      const city = 'CityX';
      const token = 'token123';
      const content = formEmailContent(weather, city, token);

      expect(content).toContain('The current weather in');
      expect(content).toContain('Rainy');
      expect(content).toContain('10°C');
      expect(content).toContain('20%');
      expect(content).toContain(`${process.env.BASE_URL}/unsubscribe/${token}`);
    });
  });
});
