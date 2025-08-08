import { of } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';

import { UserSubscribedEvent } from 'libs/contracts/events/user-subscribed.event';
import { WeatherUpdateEvent } from 'libs/contracts/events/weather-update.event';

import { MailEventService } from './mail-event.service';

describe('MailEventService', () => {
  let service: MailEventService;
  let clientProxy: ClientProxy;

  const mockClientProxy = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailEventService,
        {
          provide: 'MAIL_EVENT',
          useValue: mockClientProxy,
        },
      ],
    }).compile();

    service = module.get<MailEventService>(MailEventService);
    clientProxy = module.get<ClientProxy>('MAIL_EVENT');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendConfirmationEmail', () => {
    it('should emit user.subscribed event with correct payload', async () => {
      const payload: UserSubscribedEvent = {
        email: 'user@example.com',
        token: 'abc123',
      };

      mockClientProxy.emit.mockReturnValue(of(null)); // Simulate observable

      await service.sendConfirmationEmail(payload);

      expect(clientProxy.emit).toHaveBeenCalledWith('user.subscribed', payload);
    });
  });

  describe('sendWeatherUpdateEmail', () => {
    it('should emit weather.update event with correct payload', async () => {
      const payload: WeatherUpdateEvent = {
        weather: { temperature: 25, description: 'Cloudy', humidity: 50 },
        subscription: {
          email: 'user@example.com',
          city: 'Lviv',
          token: 'abc123',
        },
      };

      mockClientProxy.emit.mockReturnValue(of(null)); // Simulate observable

      await service.sendWeatherUpdateEmail(payload);

      expect(clientProxy.emit).toHaveBeenCalledWith('weather.update', payload);
    });
  });
});
