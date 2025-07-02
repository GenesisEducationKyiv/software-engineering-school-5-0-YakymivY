import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

import { WeatherResponse } from '../interfaces/weather.interface';

import { OpenWeatherMapHandler } from './openweathermap.handler';

describe('OpenWeatherMapHandler', () => {
  let service: OpenWeatherMapHandler;
  let httpService: { get: jest.Mock };
  let configService: { getOrThrow: jest.Mock };

  const mockApiKey = 'fake-openweather-api-key';

  beforeEach(async () => {
    httpService = { get: jest.fn() };
    configService = { getOrThrow: jest.fn().mockReturnValue(mockApiKey) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenWeatherMapHandler,
        { provide: HttpService, useValue: httpService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<OpenWeatherMapHandler>(OpenWeatherMapHandler);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch and return weather data', async () => {
    const city = 'Kyiv';
    const response: AxiosResponse = {
      data: {
        main: { temp: 20, humidity: 60 },
        weather: [{ description: 'clear sky' }],
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

    httpService.get.mockReturnValue(of(response));

    const result = await service['fetch'](city);

    const expected: WeatherResponse = {
      temperature: 20,
      humidity: 60,
      description: 'clear sky',
    };

    expect(result).toEqual(expected);
    expect(httpService.get).toHaveBeenCalledWith(
      expect.stringContaining(`q=${city}`),
    );
  });

  it('should throw NotFoundException if city not found (404)', async () => {
    const city = 'InvalidCity';
    const error = {
      response: {
        data: { cod: 404 },
      },
    };

    httpService.get.mockReturnValue(throwError(() => error));

    await expect(service['fetch'](city)).rejects.toThrow(NotFoundException);
  });

  it('should throw InternalServerErrorException for other errors', async () => {
    const city = 'Kyiv';
    const error = {
      response: {
        data: { cod: 500 },
      },
    };

    httpService.get.mockReturnValue(throwError(() => error));

    await expect(service['fetch'](city)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
