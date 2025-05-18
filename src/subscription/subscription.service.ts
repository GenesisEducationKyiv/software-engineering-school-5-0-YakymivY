import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { SubscriptionDto } from './dtos/subscription.dto';
import { Subscription } from './entities/subscription.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from './mail.service';
import { v4 as uuidv4 } from 'uuid';
import { Frequency } from 'src/common/enums/frequency.enum';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly mailService: MailService,
  ) {}

  async createSubscription(
    subscriptionDto: SubscriptionDto,
  ): Promise<{ message: string }> {
    try {
      const { email, city, frequency } = subscriptionDto;

      const existingEmail = await this.subscriptionRepository.findOne({
        where: { email, city, frequency },
      });

      if (existingEmail) {
        throw new ConflictException('Subscription already exists');
      }

      const token = uuidv4();
      const subscription = this.subscriptionRepository.create({
        email,
        city,
        frequency,
        token,
      });

      await this.subscriptionRepository.save(subscription);

      const confirmUrl = `http://localhost:3000/api/confirm/${token}`;
      try {
        await this.mailService.sendMail(
          email,
          'Weather Subscription',
          `<p>Thanks for subscribing!</p><p>Click the link below to confirm:</p><a href="${confirmUrl}">Confirm Subscription</a>`,
        );
      } catch (error) {
        this.logger.error('Error sending welcome email: ', error);
      }

      return {
        message: 'Subscription created successfully',
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('Error creating subscription: ', error);
      throw new InternalServerErrorException('Failed to create subscription');
    }
  }

  async confirmSubscription(token: string) {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { token },
      });

      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }

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

  async removeSubscription(token: string) {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { token },
      });

      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }

      await this.subscriptionRepository.remove(subscription);

      return {
        message: 'User unsubscribed successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error removing subscription: ', error);
      throw new InternalServerErrorException('Failed to remove subscription');
    }
  }

  async getActiveSubscriptions(frequency: Frequency) {
    try {
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
