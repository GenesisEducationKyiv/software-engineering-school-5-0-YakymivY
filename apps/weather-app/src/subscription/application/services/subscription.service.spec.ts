import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { Frequency } from '../../../common/enums/frequency.enum';
import { Subscription } from '../../domain/entities/subscription.entity';
import { MailService } from '../../infrastructure/interfaces/mail-service.interface';
import { Metrics } from '../../../common/interfaces/metrics.interface';

import { SubscriptionService } from './subscription.service';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let repository: jest.Mocked<Repository<Subscription>>;
  let mailService: jest.Mocked<MailService>;
  let metrics: jest.Mocked<Metrics>;

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      find: jest.fn(),
    };

    const mockMailService = {
      sendConfirmationEmail: jest.fn(),
    };

    const mockConfigService = {
      getOrThrow: jest.fn().mockReturnValue('http://localhost:3000'),
    };

    const mockMetricsService = {
      trackDbOperation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: getRepositoryToken(Subscription), useValue: mockRepository },
        { provide: 'MailService', useValue: mockMailService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: 'MetricsService', useValue: mockMetricsService },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    repository = module.get(getRepositoryToken(Subscription));
    mailService = module.get('MailService');
    metrics = module.get('MetricsService');
  });

  describe('createSubscription', () => {
    const subscriptionDto = {
      email: 'test@example.com',
      city: 'City',
      frequency: Frequency.DAILY,
    };

    it('should create subscription and send confirmation email', async () => {
      repository.findOne.mockResolvedValue(null);

      const createdSubscription = {
        ...subscriptionDto,
        token: 'uuid-token',
        confirmed: false,
        createdAt: new Date(),
      } as Subscription;

      repository.create.mockReturnValue(createdSubscription);
      repository.save.mockResolvedValue(createdSubscription);

      const result = await service.createSubscription(subscriptionDto);

      expect(metrics.trackDbOperation).toHaveBeenCalledWith(
        'SELECT',
        'Subscription',
        'subscriptionRepository',
        expect.any(Function),
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: subscriptionDto.email },
      });
      expect(repository.create).toHaveBeenCalledWith({
        email: subscriptionDto.email,
        city: subscriptionDto.city,
        frequency: subscriptionDto.frequency,
        token: expect.any(String),
      });

      expect(metrics.trackDbOperation).toHaveBeenCalledWith(
        'INSERT',
        'Subscription',
        'subscriptionRepository',
        expect.any(Function),
      );

      expect(mailService.sendConfirmationEmail).toHaveBeenCalledWith({
        email: subscriptionDto.email,
        token: expect.any(String),
      });

      expect(result).toEqual({
        message: 'Subscription successful. Confirmation email sent.',
      });
    });

    it('should throw ConflictException if email already subscribed', async () => {
      const existingSubscription = {
        id: '1',
        email: subscriptionDto.email,
        city: subscriptionDto.city,
        frequency: subscriptionDto.frequency,
        token: 'existing-token',
        confirmed: false,
        createdAt: new Date(),
      };

      metrics.trackDbOperation.mockImplementationOnce((_, __, ___, ____) =>
        Promise.resolve(existingSubscription),
      );

      await expect(service.createSubscription(subscriptionDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('confirmSubscription', () => {
    it('should confirm subscription if token found', async () => {
      const subscription = {
        token: 'token',
        confirmed: false,
        id: '1',
        email: 'test@example.com',
        city: 'City',
        frequency: Frequency.DAILY,
        createdAt: new Date(),
      };

      metrics.trackDbOperation
        .mockImplementationOnce(() => Promise.resolve(subscription))
        .mockImplementationOnce((operation, entity, repo, callback) =>
          callback(),
        );

      repository.save.mockResolvedValue({ ...subscription, confirmed: true });

      const result = await service.confirmSubscription('token');

      expect(metrics.trackDbOperation).toHaveBeenNthCalledWith(
        1,
        'SELECT',
        'Subscription',
        'subscriptionRepository',
        expect.any(Function),
      );

      expect(metrics.trackDbOperation).toHaveBeenNthCalledWith(
        2,
        'UPDATE',
        'Subscription',
        'subscriptionRepository',
        expect.any(Function),
      );

      expect(repository.save).toHaveBeenCalledWith({
        ...subscription,
        confirmed: true,
      });

      expect(result).toEqual({
        message: 'Subscription confirmed successfully',
      });
    });

    it('should throw NotFoundException if token not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.confirmSubscription('token')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeSubscription', () => {
    it('should remove subscription if token found', async () => {
      const subscription = {
        token: 'token',
        id: '1',
        email: 'test@example.com',
        city: 'City',
        frequency: Frequency.DAILY,
        confirmed: false,
        createdAt: new Date(),
      };

      metrics.trackDbOperation.mockImplementationOnce(() =>
        Promise.resolve(subscription),
      );

      repository.remove.mockResolvedValue(undefined);

      const result = await service.removeSubscription('token');

      expect(metrics.trackDbOperation).toHaveBeenCalledWith(
        'SELECT',
        'Subscription',
        'subscriptionRepository',
        expect.any(Function),
      );

      expect(repository.remove).toHaveBeenCalledWith(subscription);

      expect(result).toEqual({
        message: 'Unsubscribed successfully',
      });
    });

    it('should throw NotFoundException if token not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.removeSubscription('token')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getActiveSubscriptions', () => {
    it('should return subscriptions with confirmed: true and frequency', async () => {
      const subs = [
        {
          id: 1,
          email: 'test@example.com',
          city: 'City',
          frequency: Frequency.DAILY,
          token: 'token',
          confirmed: true,
          createdAt: new Date(),
        },
        {
          id: '2',
          email: 'test2@example.com',
          city: 'City2',
          frequency: Frequency.DAILY,
          token: 'token2',
          confirmed: true,
          createdAt: new Date(),
        },
      ] as Subscription[];

      metrics.trackDbOperation.mockImplementation(
        (_operation, _entity, _repo, _callback) => Promise.resolve(subs),
      );

      const result = await service.getActiveSubscriptions(Frequency.DAILY);

      expect(metrics.trackDbOperation).toHaveBeenCalledWith(
        'SELECT',
        'Subscription',
        'subscriptionRepository',
        expect.any(Function),
      );

      expect(repository.find).toHaveBeenCalledWith({
        where: { confirmed: true, frequency: Frequency.DAILY },
      });
      expect(result).toEqual(subs);
    });
  });
});
