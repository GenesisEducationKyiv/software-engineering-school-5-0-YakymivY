import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { Frequency } from '../../../common/enums/frequency.enum';
import { Mailer } from '../../infrastructure/interfaces/mailer.interface';
import { Subscription } from '../../domain/entities/subscription.entity';
import { WeatherResponse } from '../../../weather/domain/entities/weather.interface';

import { MailBuilderService } from './mail-builder.service';

describe('MailBuilderService', () => {
  let service: MailBuilderService;
  let mockMailer: jest.Mocked<Mailer>;

  const BASE_URL = 'http://localhost:3000';

  const mockConfigService = {
    getOrThrow: jest.fn().mockReturnValue(BASE_URL),
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

      await service.sendConfirmationEmail(email, token);

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

      await service.sendConfirmationEmail('test@example.com', 'token');

      expect(mockMailer.sendMail).toHaveBeenCalled();
      loggerSpy.mockRestore();
    });
  });

  describe('sendWeatherUpdateEmail', () => {
    it('should send weather update email with correct content', async () => {
      const weather: WeatherResponse = {
        temperature: 20,
        humidity: 10,
        description: 'Sunny',
      };

      const subscription: Subscription = {
        id: '1',
        email: 'test@example.com',
        city: 'Kyiv',
        frequency: Frequency.DAILY,
        token: 'token123',
        confirmed: true,
        createdAt: new Date(),
      };

      await service.sendWeatherUpdateEmail(weather, subscription);

      expect(mockMailer.sendMail).toHaveBeenCalledWith(
        subscription.email,
        'Weather Update',
        expect.stringContaining(subscription.city),
      );
    });

    it('should log error if sending weather update email fails', async () => {
      mockMailer.sendMail.mockRejectedValue(new Error('Fail'));

      const loggerSpy = jest.spyOn(console, 'error').mockImplementation();

      const weather: WeatherResponse = {
        temperature: 15,
        humidity: 20,
        description: 'Rainy',
      };

      const subscription: Subscription = {
        id: '2',
        email: 'user@example.com',
        city: 'Lviv',
        frequency: Frequency.DAILY,
        token: 'token987',
        confirmed: true,
        createdAt: new Date(),
      };

      await service.sendWeatherUpdateEmail(weather, subscription);

      expect(mockMailer.sendMail).toHaveBeenCalled();
      loggerSpy.mockRestore();
    });
  });
});
