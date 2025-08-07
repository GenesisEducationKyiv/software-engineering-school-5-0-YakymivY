import { Test, TestingModule } from '@nestjs/testing';

import { UserSubscribedEvent, WeatherUpdateEvent } from '@app/contracts';

import { MailBuilder } from '../../application/interfaces/mail-builder.interface';

import { MailEventController } from './mail-event.controller';

describe('MailEventController', () => {
  let controller: MailEventController;
  let mailBuilderService: MailBuilder;

  const mockMailBuilderService: MailBuilder = {
    sendConfirmationEmail: jest.fn(),
    sendWeatherUpdateEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailEventController],
      providers: [
        {
          provide: 'MailBuilder',
          useValue: mockMailBuilderService,
        },
      ],
    }).compile();

    controller = module.get<MailEventController>(MailEventController);
    mailBuilderService = module.get<MailBuilder>('MailBuilder');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('onUserSubscribed', () => {
    it('should call sendConfirmationEmail with correct data', async () => {
      const event: UserSubscribedEvent = {
        email: 'user@example.com',
        token: 'abc123',
      };

      await controller.onUserSubscribed(event);

      expect(mailBuilderService.sendConfirmationEmail).toHaveBeenCalledWith({
        email: 'user@example.com',
        token: 'abc123',
      });
    });
  });

  describe('onWeatherUpdate', () => {
    it('should call sendWeatherUpdateEmail with correct data', async () => {
      const event: WeatherUpdateEvent = {
        weather: { temperature: 22, description: 'Sunny', humidity: 50 },
        subscription: {
          email: 'user@example.com',
          city: 'Kyiv',
          token: 'abc123',
        },
      };

      await controller.onWeatherUpdate(event);

      expect(mailBuilderService.sendWeatherUpdateEmail).toHaveBeenCalledWith({
        weather: event.weather,
        subscription: event.subscription,
      });
    });
  });
});
