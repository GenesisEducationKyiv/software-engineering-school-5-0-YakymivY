import { Test, TestingModule } from '@nestjs/testing';

<<<<<<< HEAD
import { Frequency } from '../../common/enums/frequency.enum';
=======
import { formEmailContent } from '../../weather/utils/weather.utils';
import { Frequency } from '../../common/enums/frequency.enum';
import { WeatherService } from '../../weather/services/weather.service';
>>>>>>> c797021 (scheduled updates separated & folder structure changed)
import { Subscription } from '../entities/subscription.entity';

import { ScheduledUpdatesService } from './scheduled-updates.service';
import { SubscriptionService } from './subscription.service';
<<<<<<< HEAD
import { MailBuilderService } from './mail-builder.service';
=======
import { MailService } from './mail.service';
>>>>>>> c797021 (scheduled updates separated & folder structure changed)

jest.mock('../../weather/utils/weather.utils', () => ({
  formEmailContent: jest.fn(),
}));

describe('ScheduledUpdatesService', () => {
  let service: ScheduledUpdatesService;

  const mockGetActiveSubscriptions = jest.fn();
<<<<<<< HEAD
  const mockSendWeatherUpdateEmail = jest.fn();
  const mockGetWeather = jest.fn();
=======
  const mockSendMail = jest.fn();
  const mockGetWeather = jest.fn();
  const mockFormEmailContent = formEmailContent as jest.Mock;
>>>>>>> c797021 (scheduled updates separated & folder structure changed)

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
<<<<<<< HEAD
          provide: MailBuilderService,
          useValue: {
            sendWeatherUpdateEmail: mockSendWeatherUpdateEmail,
          },
        },
        {
          provide: 'WeatherApi',
          useValue: {
            getCurrentWeather: mockGetWeather,
=======
          provide: MailService,
          useValue: {
            sendMail: mockSendMail,
          },
        },
        {
          provide: WeatherService,
          useValue: {
            getWeather: mockGetWeather,
>>>>>>> c797021 (scheduled updates separated & folder structure changed)
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
<<<<<<< HEAD
=======
      mockSendMail.mockResolvedValue(undefined);
>>>>>>> c797021 (scheduled updates separated & folder structure changed)
      mockGetWeather.mockResolvedValue({
        temperature: 25,
        humidity: 55,
        description: 'Partly cloudy',
      });
<<<<<<< HEAD
=======
      mockFormEmailContent.mockReturnValue('Email content with Partly cloudy');
>>>>>>> c797021 (scheduled updates separated & folder structure changed)

      await service.sendHourlyUpdates();

      expect(mockGetActiveSubscriptions).toHaveBeenCalledWith(Frequency.HOURLY);
<<<<<<< HEAD
      expect(mockSendWeatherUpdateEmail).toHaveBeenCalledWith(
        {
          temperature: 25,
          humidity: 55,
          description: 'Partly cloudy',
        },
        subs[0],
=======
      expect(mockSendMail).toHaveBeenCalledWith(
        'a@example.com',
        'Weather Update',
        'Email content with Partly cloudy',
>>>>>>> c797021 (scheduled updates separated & folder structure changed)
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
<<<<<<< HEAD
=======
      mockSendMail.mockResolvedValue(undefined);
>>>>>>> c797021 (scheduled updates separated & folder structure changed)
      mockGetWeather.mockResolvedValue({
        temperature: 15,
        humidity: 65,
        description: 'Cloudy',
      });
<<<<<<< HEAD
=======
      mockFormEmailContent.mockReturnValue('Email content with Cloudy');
>>>>>>> c797021 (scheduled updates separated & folder structure changed)

      await service.sendDailyUpdates();

      expect(mockGetActiveSubscriptions).toHaveBeenCalledWith(Frequency.DAILY);
<<<<<<< HEAD
      expect(mockSendWeatherUpdateEmail).toHaveBeenCalledWith(
        {
          temperature: 15,
          humidity: 65,
          description: 'Cloudy',
        },
        subs[0],
=======
      expect(mockSendMail).toHaveBeenCalledWith(
        'b@example.com',
        'Weather Update',
        'Email content with Cloudy',
>>>>>>> c797021 (scheduled updates separated & folder structure changed)
      );
    });
  });
});
