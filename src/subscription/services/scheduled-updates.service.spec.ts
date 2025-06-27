import { Test, TestingModule } from '@nestjs/testing';

import { Frequency } from '../../common/enums/frequency.enum';
import { Subscription } from '../entities/subscription.entity';

import { ScheduledUpdatesService } from './scheduled-updates.service';
import { SubscriptionService } from './subscription.service';
import { MailBuilderService } from './mail-builder.service';

jest.mock('../../weather/utils/weather.utils', () => ({
  formEmailContent: jest.fn(),
}));

describe('ScheduledUpdatesService', () => {
  let service: ScheduledUpdatesService;

  const mockGetActiveSubscriptions = jest.fn();
  const mockSendWeatherUpdateEmail = jest.fn();
  const mockGetWeather = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduledUpdatesService,
        {
          provide: SubscriptionService,
          useValue: {
            getActiveSubscriptions: mockGetActiveSubscriptions,
          },
        },
        {
          provide: MailBuilderService,
          useValue: {
            sendWeatherUpdateEmail: mockSendWeatherUpdateEmail,
          },
        },
        {
          provide: 'WeatherApi',
          useValue: {
            getCurrentWeather: mockGetWeather,
          },
        },
      ],
    }).compile();

    service = module.get<ScheduledUpdatesService>(ScheduledUpdatesService);
  });

  describe('sendHourlyUpdates', () => {
    it('should get hourly subscriptions and send emails', async () => {
      const subs = [
        {
          email: 'a@example.com',
          city: 'CityA',
          token: 'tokenA',
        } as Subscription,
      ];
      mockGetActiveSubscriptions.mockResolvedValue(subs);
      mockSendWeatherUpdateEmail.mockResolvedValue(undefined);
      mockGetWeather.mockResolvedValue({
        temperature: 25,
        humidity: 55,
        description: 'Partly cloudy',
      });

      await service.sendHourlyUpdates();

      expect(mockGetActiveSubscriptions).toHaveBeenCalledWith(Frequency.HOURLY);
      expect(mockSendWeatherUpdateEmail).toHaveBeenCalledWith(
        {
          temperature: 25,
          humidity: 55,
          description: 'Partly cloudy',
        },
        subs[0],
      );
    });
  });

  describe('sendDailyUpdates', () => {
    it('should get daily subscriptions and send emails', async () => {
      const subs = [
        {
          email: 'b@example.com',
          city: 'CityB',
          token: 'tokenB',
        } as Subscription,
      ];
      mockGetActiveSubscriptions.mockResolvedValue(subs);
      mockSendWeatherUpdateEmail.mockResolvedValue(undefined);
      mockGetWeather.mockResolvedValue({
        temperature: 15,
        humidity: 65,
        description: 'Cloudy',
      });

      await service.sendDailyUpdates();

      expect(mockGetActiveSubscriptions).toHaveBeenCalledWith(Frequency.DAILY);
      expect(mockSendWeatherUpdateEmail).toHaveBeenCalledWith(
        {
          temperature: 15,
          humidity: 65,
          description: 'Cloudy',
        },
        subs[0],
      );
    });
  });
});
