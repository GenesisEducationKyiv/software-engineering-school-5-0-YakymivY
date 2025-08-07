import { Test, TestingModule } from '@nestjs/testing';
import { ClientGrpc } from '@nestjs/microservices';
import { of } from 'rxjs';

import { SendWeatherUpdateEmailRequest } from '@app/common';

import { MailClientService } from './mail-client.service';

describe('MailClientService', () => {
  let service: MailClientService;
  let mockGrpcClient: ClientGrpc;
  let mockMailServiceClient: any;

  beforeEach(async () => {
    mockMailServiceClient = {
      sendConfirmationEmail: jest.fn().mockReturnValue(of(undefined)),
      sendWeatherUpdateEmail: jest.fn().mockReturnValue(of(undefined)),
    };

    mockGrpcClient = {
      getService: jest.fn().mockReturnValue(mockMailServiceClient),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailClientService,
        {
          provide: 'MAIL_PACKAGE',
          useValue: mockGrpcClient,
        },
      ],
    }).compile();

    service = module.get<MailClientService>(MailClientService);
    service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call sendConfirmationEmail with correct data', () => {
    const mockRequest = { email: 'test@example.com', token: '123' };

    service.sendConfirmationEmail(mockRequest);

    expect(mockMailServiceClient.sendConfirmationEmail).toHaveBeenCalledWith(
      mockRequest,
    );
  });

  it('should call sendWeatherUpdateEmail with correct data', () => {
    const mockRequest: SendWeatherUpdateEmailRequest = {
      weather: {
        temperature: 25,
        humidity: 55,
        description: 'Partly cloudy',
      },
      subscription: {
        email: 'test@example.com',
        city: 'London',
        token: '123',
      },
    };

    service.sendWeatherUpdateEmail(mockRequest);

    expect(mockMailServiceClient.sendWeatherUpdateEmail).toHaveBeenCalledWith(
      mockRequest,
    );
  });
});
