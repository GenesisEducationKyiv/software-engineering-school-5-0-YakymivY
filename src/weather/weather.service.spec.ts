import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { SubscriptionService } from '../subscription/subscription.service';
import { MailService } from '../subscription/mail.service';
import { Frequency } from '../common/enums/frequency.enum';
import { Subscription } from '../subscription/entities/subscription.entity';

import { WeatherService } from './weather.service';
import { WeatherResponse } from './interfaces/weather.interface';
import { formEmailContent } from './utils/weather.utils';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpService: HttpService;
  let subscriptionService: SubscriptionService;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: HttpService,
          useValue: { get: jest.fn() },
        },
        {
          provide: SubscriptionService,
          useValue: {
            getActiveSubscriptions: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    httpService = module.get<HttpService>(HttpService);
    subscriptionService = module.get<SubscriptionService>(SubscriptionService);
    mailService = module.get<MailService>(MailService);
  });

  describe('sendHourlyUpdates', () => {
    it('should get hourly subscriptions and send emails', async () => {
      const subs = [{ email: 'a@example.com', city: 'CityA', token: 'tokenA' }];
      jest
        .spyOn(subscriptionService, 'getActiveSubscriptions')
        .mockResolvedValue(subs as Subscription[]);
      jest.spyOn(service, 'getWeather').mockResolvedValue({
        temperature: 20,
        humidity: 50,
        description: 'Sunny',
      });
      jest.spyOn(mailService, 'sendMail').mockResolvedValue();

      await service.sendHourlyUpdates();

      expect(subscriptionService.getActiveSubscriptions).toHaveBeenCalledWith(
        Frequency.HOURLY,
      );
      expect(service.getWeather).toHaveBeenCalledWith('CityA');
      expect(mailService.sendMail).toHaveBeenCalledWith(
        'a@example.com',
        'Weather Update',
        expect.stringContaining('Sunny'),
      );
    });
  });

  describe('sendDailyUpdates', () => {
    it('should get daily subscriptions and send emails', async () => {
      const subs = [{ email: 'b@example.com', city: 'CityB', token: 'tokenB' }];
      jest
        .spyOn(subscriptionService, 'getActiveSubscriptions')
        .mockResolvedValue(subs as Subscription[]);
      jest.spyOn(service, 'getWeather').mockResolvedValue({
        temperature: 15,
        humidity: 60,
        description: 'Cloudy',
      });
      jest.spyOn(mailService, 'sendMail').mockResolvedValue();

      await service.sendDailyUpdates();

      expect(subscriptionService.getActiveSubscriptions).toHaveBeenCalledWith(
        Frequency.DAILY,
      );
      expect(service.getWeather).toHaveBeenCalledWith('CityB');
      expect(mailService.sendMail).toHaveBeenCalledWith(
        'b@example.com',
        'Weather Update',
        expect.stringContaining('Cloudy'),
      );
    });
  });

  describe('getWeather', () => {
    beforeEach(() => {
      process.env.WEATHER_API_KEY = 'testkey';
    });

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

      const result = await service.getWeather('TestCity');

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

      await expect(service.getWeather('UnknownCity')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException on other errors', async () => {
      const errorResponse = {
        response: { data: { error: { code: 1234 } } },
      };
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => errorResponse));

      await expect(service.getWeather('BadCity')).rejects.toThrow(
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
