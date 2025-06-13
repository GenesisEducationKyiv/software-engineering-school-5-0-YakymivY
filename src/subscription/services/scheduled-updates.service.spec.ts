import { Test, TestingModule } from '@nestjs/testing';

import { formEmailContent } from '../../weather/utils/weather.utils';
import { Frequency } from '../../common/enums/frequency.enum';
import { WeatherService } from '../../weather/services/weather.service';
import { Subscription } from '../entities/subscription.entity';

import { ScheduledUpdatesService } from './scheduled-updates.service';
import { SubscriptionService } from './subscription.service';
import { MailService } from './mail.service';

jest.mock('../../weather/utils/weather.utils', () => ({
  formEmailContent: jest.fn(),
}));

describe('ScheduledUpdatesService', () => {
  let service: ScheduledUpdatesService;

  const mockGetActiveSubscriptions = jest.fn();
  const mockSendMail = jest.fn();
  const mockGetWeather = jest.fn();
  const mockFormEmailContent = formEmailContent as jest.Mock;

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
          provide: MailService,
          useValue: {
            sendMail: mockSendMail,
          },
        },
        {
          provide: WeatherService,
          useValue: {
            getWeather: mockGetWeather,
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
      mockSendMail.mockResolvedValue(undefined);
      mockGetWeather.mockResolvedValue({
        temperature: 25,
        humidity: 55,
        description: 'Partly cloudy',
      });
      mockFormEmailContent.mockReturnValue('Email content with Partly cloudy');

      await service.sendHourlyUpdates();

      expect(mockGetActiveSubscriptions).toHaveBeenCalledWith(Frequency.HOURLY);
      expect(mockSendMail).toHaveBeenCalledWith(
        'a@example.com',
        'Weather Update',
        'Email content with Partly cloudy',
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
      mockSendMail.mockResolvedValue(undefined);
      mockGetWeather.mockResolvedValue({
        temperature: 15,
        humidity: 65,
        description: 'Cloudy',
      });
      mockFormEmailContent.mockReturnValue('Email content with Cloudy');

      await service.sendDailyUpdates();

      expect(mockGetActiveSubscriptions).toHaveBeenCalledWith(Frequency.DAILY);
      expect(mockSendMail).toHaveBeenCalledWith(
        'b@example.com',
        'Weather Update',
        'Email content with Cloudy',
      );
    });
  });
});
