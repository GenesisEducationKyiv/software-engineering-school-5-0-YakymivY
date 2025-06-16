import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

import { MailService } from './mail.service';

jest.mock('nodemailer');

describe('MailService', () => {
  let service: MailService;

  const sendMailMock = jest.fn();

  beforeEach(async () => {
    const mockConfigService = {
      getOrThrow: jest.fn().mockReturnValue('http://localhost:3000'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send email successfully', async () => {
    sendMailMock.mockResolvedValueOnce(true);

    await expect(
      service.sendMail('test@example.com', 'Test Subject', '<p>Hello</p>'),
    ).resolves.toBeUndefined();

    expect(sendMailMock).toHaveBeenCalledWith({
      from: `"Weather App" <${process.env.MAIL_USER}>`,
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
