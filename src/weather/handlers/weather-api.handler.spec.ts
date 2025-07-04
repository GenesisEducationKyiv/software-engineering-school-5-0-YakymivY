import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

import { WeatherApiHandler } from './weather-api.handler';

describe('WeatherApiHandler', () => {
  let service: WeatherApiHandler;

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockConfigService = {
    getOrThrow: jest.fn().mockReturnValue('mock-api-key'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherApiHandler,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get(WeatherApiHandler);
  });

  afterEach(() => jest.clearAllMocks());

  it('should fetch and return weather data', async () => {
    const mockResponse: AxiosResponse = {
      data: {
        current: {
          temp_c: 23,
          humidity: 55,
          condition: { text: 'Sunny' },
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

    mockHttpService.get.mockReturnValue(of(mockResponse));

    const result = await (service as any).fetch('Kyiv');

    expect(result).toEqual({
      provider: 'weatherapi.com',
      weather: {
        temperature: 23,
        humidity: 55,
        description: 'Sunny',
      },
    });

    expect(mockHttpService.get).toHaveBeenCalledWith(
      expect.stringContaining('q=Kyiv'),
    );
  });

  it('should throw NotFoundException for city not found error', async () => {
    const mockError = {
      response: {
        data: {
          error: { code: 1006 },
        },
      },
    };

    mockHttpService.get.mockReturnValue(throwError(() => mockError));

    await expect((service as any).fetch('InvalidCity')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw InternalServerErrorException for other errors', async () => {
    const mockError = {
      response: {
        data: {
          error: { code: 9999 },
        },
      },
    };

    mockHttpService.get.mockReturnValue(throwError(() => mockError));

    await expect((service as any).fetch('ServerCrashedCity')).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
