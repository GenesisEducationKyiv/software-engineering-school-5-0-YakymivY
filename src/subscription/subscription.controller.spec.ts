import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionController } from './subscription.controller';
import { Frequency } from '../common/enums/frequency.enum';
import { SubscriptionService } from './subscription.service';
import { SubscriptionDto } from './dtos/subscription.dto';
import { TokenDto } from './dtos/token.dto';

describe('SubscriptionController', () => {
  let controller: SubscriptionController;
  let service: SubscriptionService;

  const mockService = {
    createSubscription: jest.fn(),
    confirmSubscription: jest.fn(),
    removeSubscription: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [
        {
          provide: SubscriptionService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SubscriptionController>(SubscriptionController);
    service = module.get<SubscriptionService>(SubscriptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSubscription', () => {
    it('should call service and return message', async () => {
      const dto: SubscriptionDto = {
        email: 'test@example.com',
        city: 'London',
        frequency: Frequency.DAILY,
      };

      const expectedResponse = {
        message: 'Subscription successful. Confirmation email sent.',
      };

      mockService.createSubscription.mockResolvedValue(expectedResponse);

      const result = await controller.createSubscription(dto);
      expect(result).toEqual(expectedResponse);
      expect(service.createSubscription).toHaveBeenCalledWith(dto);
    });
  });

  describe('confirmSubscription', () => {
    it('should call service with token', async () => {
      const dto: TokenDto = { token: 'abc-123' };
      const mockResponse = { message: 'Confirmed' };

      mockService.confirmSubscription.mockResolvedValue(mockResponse);

      const result = await controller.confirmSubscription(dto);
      expect(result).toEqual(mockResponse);
      expect(service.confirmSubscription).toHaveBeenCalledWith(dto.token);
    });
  });

  describe('unsubscribe', () => {
    it('should call service with token', async () => {
      const dto: TokenDto = { token: 'xyz-789' };
      const mockResponse = { message: 'Unsubscribed' };

      mockService.removeSubscription.mockResolvedValue(mockResponse);

      const result = await controller.unsubscribe(dto);
      expect(result).toEqual(mockResponse);
      expect(service.removeSubscription).toHaveBeenCalledWith(dto.token);
    });
  });
});
