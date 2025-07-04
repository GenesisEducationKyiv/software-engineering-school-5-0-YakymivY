import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { Frequency } from '../../common/enums/frequency.enum';
import { Subscription } from '../entities/subscription.entity';

import { MailBuilderService } from './mail-builder.service';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let repository: jest.Mocked<Repository<Subscription>>;
  let mailBuilderService: jest.Mocked<MailBuilderService>;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: getRepositoryToken(Subscription), useValue: mockRepository },
        { provide: MailBuilderService, useValue: mockMailService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    repository = module.get(getRepositoryToken(Subscription));
    mailBuilderService = module.get(MailBuilderService);
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
      mailBuilderService.sendConfirmationEmail.mockResolvedValue(undefined);

      const result = await service.createSubscription(subscriptionDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: subscriptionDto.email },
      });

      expect(repository.create).toHaveBeenCalledWith({
        email: subscriptionDto.email,
        city: subscriptionDto.city,
        frequency: subscriptionDto.frequency,
        token: expect.any(String),
      });

      expect(repository.save).toHaveBeenCalledWith(createdSubscription);

      expect(mailBuilderService.sendConfirmationEmail).toHaveBeenCalled();

      expect(result).toEqual({
        message: 'Subscription successful. Confirmation email sent.',
      });
    });

    it('should throw ConflictException if email already subscribed', async () => {
      repository.findOne.mockResolvedValue({
        id: '1',
        email: subscriptionDto.email,
        city: subscriptionDto.city,
        frequency: subscriptionDto.frequency,
        token: 'existing-token',
        confirmed: false,
        createdAt: new Date(),
      });

      await expect(service.createSubscription(subscriptionDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException on unknown error', async () => {
      repository.findOne.mockRejectedValue(new Error('DB error'));

      await expect(service.createSubscription(subscriptionDto)).rejects.toThrow(
        InternalServerErrorException,
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
      repository.findOne.mockResolvedValue(subscription);
      repository.save.mockResolvedValue({ ...subscription, confirmed: true });

      const result = await service.confirmSubscription('token');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { token: 'token' },
      });
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

    it('should throw InternalServerErrorException on unknown error', async () => {
      repository.findOne.mockRejectedValue(new Error('DB error'));

      await expect(service.confirmSubscription('token')).rejects.toThrow(
        InternalServerErrorException,
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
      repository.findOne.mockResolvedValue(subscription);
      repository.remove.mockResolvedValue(undefined);

      const result = await service.removeSubscription('token');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { token: 'token' },
      });
      expect(repository.remove).toHaveBeenCalledWith(subscription);
      expect(result).toEqual({ message: 'Unsubscribed successfully' });
    });

    it('should throw NotFoundException if token not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.removeSubscription('token')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on unknown error', async () => {
      repository.findOne.mockRejectedValue(new Error('DB error'));

      await expect(service.removeSubscription('token')).rejects.toThrow(
        InternalServerErrorException,
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
      repository.find.mockResolvedValue(subs);

      const result = await service.getActiveSubscriptions(Frequency.DAILY);

      expect(repository.find).toHaveBeenCalledWith({
        where: { confirmed: true, frequency: Frequency.DAILY },
      });
      expect(result).toEqual(subs);
    });

    it('should throw InternalServerErrorException on unknown error', async () => {
      repository.find.mockRejectedValue(new Error('DB error'));

      await expect(
        service.getActiveSubscriptions(Frequency.DAILY),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
