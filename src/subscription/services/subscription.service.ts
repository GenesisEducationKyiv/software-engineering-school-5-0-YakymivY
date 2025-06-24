import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

import { Frequency } from '../../common/enums/frequency.enum';
import { SubscriptionDto } from '../dtos/subscription.dto';
import { Subscription } from '../entities/subscription.entity';

import { MailBuilderService } from './mail-builder.service';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  private readonly baseUrl: string;

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly mailBuilderService: MailBuilderService,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('BASE_URL');

    if (!this.baseUrl) {
      throw new Error('Missing BASE_URL environment variable');
    }
  }

  async createSubscription(
    subscriptionDto: SubscriptionDto,
  ): Promise<{ message: string }> {
    try {
      const { email, city, frequency } = subscriptionDto;

      // check if the subscription already exists
      const existingEmail = await this.subscriptionRepository.findOne({
        where: { email },
      });

      if (existingEmail) {
        throw new ConflictException('Email already subscribed');
      }

      const token = uuidv4(); // generate a unique token

      // create and save subscription
      const subscription = this.subscriptionRepository.create({
        email,
        city,
        frequency,
        token,
      });

      await this.subscriptionRepository.save(subscription);

      await this.mailBuilderService.sendConfirmationEmail(email, token);

      return {
        message: 'Subscription successful. Confirmation email sent.',
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('Error creating subscription: ', error);
      throw new InternalServerErrorException('Failed to create subscription');
    }
  }

  async confirmSubscription(token: string): Promise<{ message: string }> {
    try {
      // find the subscription
      const subscription = await this.subscriptionRepository.findOne({
        where: { token },
      });

      if (!subscription) {
        throw new NotFoundException('Token not found');
      }

      // change status to confirmed
      subscription.confirmed = true;
      await this.subscriptionRepository.save(subscription);

      return {
        message: 'Subscription confirmed successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error confirming subscription: ', error);
      throw new InternalServerErrorException('Failed to confirm subscription');
    }
  }

  async removeSubscription(token: string): Promise<{ message: string }> {
    try {
      // find the subscription
      const subscription = await this.subscriptionRepository.findOne({
        where: { token },
      });

      if (!subscription) {
        throw new NotFoundException('Token not found');
      }

      // delete the subscription from db
      await this.subscriptionRepository.remove(subscription);

      return {
        message: 'Unsubscribed successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error removing subscription: ', error);
      throw new InternalServerErrorException('Failed to remove subscription');
    }
  }

  async getActiveSubscriptions(frequency: Frequency): Promise<Subscription[]> {
    try {
      // get all confirmed subscriptions with provided frequency
      const subscriptions = await this.subscriptionRepository.find({
        where: { confirmed: true, frequency },
      });

      return subscriptions;
    } catch (error) {
      this.logger.error('Error getting active subscriptions: ', error);
      throw new InternalServerErrorException(
        'Failed to get active subscriptions',
      );
    }
  }
}
