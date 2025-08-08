import { Test, TestingModule } from '@nestjs/testing';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

import { MailService } from './mail.service';

jest.mock('nodemailer');

describe('MailService', () => {
  let service: MailService;

  const sendMailMock = jest.fn();

  const mockTransporter = {
    sendMail: sendMailMock,
  };

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      if (key === 'MAIL_USER') return 'weather@app.com';
      if (key === 'MAIL_PASS') return 'securepass';
    }),
  };

  const mockMetricsService = {
    trackMailRequest: jest.fn(),
  };

  beforeEach(async () => {
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        { provide: 'MetricsService', useValue: mockMetricsService },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send email successfully', async () => {
    sendMailMock.mockResolvedValueOnce(true);

    await expect(
      service.sendMail('test@example.com', 'Test Subject', '<p>Hello</p>'),
    ).resolves.toBeUndefined();

    expect(sendMailMock).toHaveBeenCalledWith({
      from: `"Weather App" <weather@app.com>`,
      to: 'test@example.com',
      subject: 'Test Subject',
      html: '<p>Hello</p>',
    });
  });

  it('should throw InternalServerErrorException on failure', async () => {
    sendMailMock.mockRejectedValueOnce(new Error('SMTP error'));

    await expect(
      service.sendMail('test@example.com', 'Test Subject', '<p>Hello</p>'),
    ).rejects.toThrow(InternalServerErrorException);

    expect(sendMailMock).toHaveBeenCalledTimes(1);
  });
});
