import { Test, TestingModule } from '@nestjs/testing';

import {
  SendConfirmationEmailRequest,
  SendWeatherUpdateEmailRequest,
} from '@app/common';

import { MailBuilder } from '../interfaces/mail-builder.interface';

import { MailController } from './mail.controller';

describe('MailController', () => {
  let controller: MailController;
  let mailBuilderService: MailBuilder;

  const mockMailBuilderService = {
    sendConfirmationEmail: jest.fn(),
    sendWeatherUpdateEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
      providers: [
        {
          provide: 'MailBuilder',
          useValue: mockMailBuilderService,
        },
      ],
    }).compile();

    controller = module.get<MailController>(MailController);
    mailBuilderService = module.get<MailBuilder>('MailBuilder');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendConfirmationEmail', () => {
    it('should return success true when MailBuilderService returns true', async () => {
      const mockRequest: SendConfirmationEmailRequest = {
        email: 'test@example.com',
        token: 'abc123',
      };

      mockMailBuilderService.sendConfirmationEmail.mockResolvedValue(true);

      const result = await controller.sendConfirmationEmail(mockRequest);

      expect(mailBuilderService.sendConfirmationEmail).toHaveBeenCalledWith(
        mockRequest,
      );
      expect(result).toEqual({ success: true });
    });

    it('should return success false when MailBuilderService returns false', async () => {
      const mockRequest: SendConfirmationEmailRequest = {
        email: 'fail@example.com',
        token: 'badtoken',
      };

      mockMailBuilderService.sendConfirmationEmail.mockResolvedValue(false);

      const result = await controller.sendConfirmationEmail(mockRequest);

      expect(result).toEqual({ success: false });
    });
  });

  describe('sendWeatherUpdateEmail', () => {
    it('should return success true when MailBuilderService returns true', async () => {
      const mockRequest: SendWeatherUpdateEmailRequest = {
        subscription: {
          email: 'weather@example.com',
          city: 'Kyiv',
          token: 'xyz123',
        },
        weather: {
          temperature: 25,
          humidity: 10,
          description: 'Clear',
        },
      };

      mockMailBuilderService.sendWeatherUpdateEmail.mockResolvedValue(true);

      const result = await controller.sendWeatherUpdateEmail(mockRequest);

      expect(mailBuilderService.sendWeatherUpdateEmail).toHaveBeenCalledWith(
        mockRequest,
      );
      expect(result).toEqual({ success: true });
    });
  });
});
