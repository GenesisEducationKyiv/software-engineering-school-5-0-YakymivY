import {
  Inject,
  Injectable,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';

import { Frequency } from '../../../common/enums/frequency.enum';
import { SubscriptionDto } from '../dtos/subscription.dto';
import { Subscription } from '../../domain/entities/subscription.entity';
import { MailService } from '../../infrastructure/interfaces/mail-service.interface';
import { SubscriptionHandler } from '../interfaces/subscription-handler.interface';

@Injectable()
export class SubscriptionService implements SubscriptionHandler {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @Inject('MailService') private readonly mailService: MailService,
  ) {}

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
        this.logger.error({
          userId: existingEmail.id,
          email: existingEmail.email,
          message: 'Email already subscribed',
        });
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

      await this.mailService.sendConfirmationEmail({
        email,
        token,
      });

      return {
        message: 'Subscription successful. Confirmation email sent.',
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error({
        email: subscriptionDto.email,
        message: 'Error creating subscription',
        error,
      });
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
        this.logger.error({
          token,
          message: 'Token not found for confirmation',
        });
        throw new NotFoundException('Token not found');
      }

      // change status to confirmed
      subscription.confirmed = true;
      await this.subscriptionRepository.save(subscription);

      this.logger.log({
        userId: subscription.id,
        email: subscription.email,
        message: 'Subscription confirmed successfully',
      });

      return {
        message: 'Subscription confirmed successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error({
        token,
        message: 'Error confirming subscription',
        error,
      });
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
        this.logger.error({
          token,
          message: 'Token not found for removal',
        });
        throw new NotFoundException('Token not found');
      }

      // delete the subscription from db
      await this.subscriptionRepository.remove(subscription);

      this.logger.log({
        userId: subscription.id,
        email: subscription.email,
        message: 'Unsubscribed successfully',
      });

      return {
        message: 'Unsubscribed successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error({
        token,
        message: 'Error removing subscription',
        error,
      });
      throw new InternalServerErrorException('Failed to remove subscription');
    }
  }

  async getActiveSubscriptions(frequency: Frequency): Promise<Subscription[]> {
    try {
      // get all confirmed subscriptions with provided frequency
      const subscriptions = await this.subscriptionRepository.find({
        where: { confirmed: true, frequency },
      });

      this.logger.log({
        frequency,
        message: 'Active subscriptions retrieved successfully',
        subscriptions,
      });

      return subscriptions;
    } catch (error) {
      this.logger.error({
        frequency,
        message: 'Error getting active subscriptions',
        error,
      });
      throw new InternalServerErrorException(
        'Failed to get active subscriptions',
      );
    }
  }
}
