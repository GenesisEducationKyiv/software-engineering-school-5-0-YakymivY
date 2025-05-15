import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { SubscriptionDto } from './dtos/subscription.dto';
import { Subscription } from './entities/subscription.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
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

      const subscription = this.subscriptionRepository.create({
        email,
        city,
        frequency,
      });

      await this.subscriptionRepository.save(subscription);

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
}
