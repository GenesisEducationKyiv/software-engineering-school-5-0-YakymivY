import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionDto } from './dtos/subscription.dto';
import { Subscription } from './entities/subscription.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from './mail.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SubscriptionService {
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
        where: { email },
      });

      if (existingEmail) {
        throw new ConflictException('Email already subscribed');
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
        console.error('Error sending welcome email: ', error);
      }

      return {
        message: 'Subscription created successfully',
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
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

      subscription.isVerified = true;
      subscription.isActive = true;
      await this.subscriptionRepository.save(subscription);

      return {
        message: 'Subscription confirmed successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
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

      subscription.isActive = false;
      await this.subscriptionRepository.save(subscription);

      return {
        message: 'User unsubscribed successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove subscription');
    }
  }
}
