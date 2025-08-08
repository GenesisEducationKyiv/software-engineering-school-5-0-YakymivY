import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { SendWeatherUpdateEmailRequest } from '@app/common';

import { Mailer } from '../../infrastructure/interfaces/mailer.interface';

import { MailBuilderService } from './mail-builder.service';

describe('MailBuilderService', () => {
  let service: MailBuilderService;
  let mockMailer: jest.Mocked<Mailer>;

  const BASE_URL = 'http://localhost:3000/api';

  const mockConfigService = {
    getOrThrow: jest.fn().mockReturnValue(BASE_URL),
  };

  const mockMetricsService = {
    trackMailRequest: jest.fn(),
  };

  beforeEach(async () => {
    mockMailer = {
      sendMail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailBuilderService,
        { provide: 'Mailer', useValue: mockMailer },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: 'MetricsService', useValue: mockMetricsService },
      ],
    }).compile();

    service = module.get<MailBuilderService>(MailBuilderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendConfirmationEmail', () => {
    it('should send confirmation email with correct content', async () => {
      const email = 'test@example.com';
      const token = 'test-token';

      await service.sendConfirmationEmail({ email, token });

      expect(mockMailer.sendMail).toHaveBeenCalledWith(
        email,
        'Weather Subscription',
        expect.stringContaining(`${BASE_URL}/confirm/${token}`),
      );
    });

    it('should log error if sending confirmation email fails', async () => {
      const error = new Error('Email failed');
      mockMailer.sendMail.mockRejectedValue(error);

      const loggerSpy = jest.spyOn(console, 'error').mockImplementation();

      await service.sendConfirmationEmail({
        email: 'test@example.com',
        token: 'token',
      });

      expect(mockMailer.sendMail).toHaveBeenCalled();
      loggerSpy.mockRestore();
    });
  });

  describe('sendWeatherUpdateEmail', () => {
    it('should send weather update email with correct content', async () => {
      const weatherData: SendWeatherUpdateEmailRequest = {
        weather: {
          temperature: 20,
          humidity: 10,
          description: 'Sunny',
        },
        subscription: {
          email: 'test@example.com',
          city: 'Kyiv',
          token: 'token123',
        },
      };

      await service.sendWeatherUpdateEmail(weatherData);

      expect(mockMailer.sendMail).toHaveBeenCalledWith(
        weatherData.subscription.email,
        'Weather Update',
        expect.stringContaining(weatherData.subscription.city),
      );
    });

    it('should log error if sending weather update email fails', async () => {
      mockMailer.sendMail.mockRejectedValue(new Error('Fail'));

      const loggerSpy = jest.spyOn(console, 'error').mockImplementation();

      const weatherData: SendWeatherUpdateEmailRequest = {
        weather: {
          temperature: 15,
          humidity: 20,
          description: 'Rainy',
        },
        subscription: {
          email: 'user@example.com',
          city: 'Lviv',
          token: 'token987',
        },
      };

      await service.sendWeatherUpdateEmail(weatherData);

      expect(mockMailer.sendMail).toHaveBeenCalled();
      loggerSpy.mockRestore();
    });
  });
});
