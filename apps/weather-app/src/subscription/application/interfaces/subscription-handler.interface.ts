import { Frequency } from '../../../common/enums/frequency.enum';
import { SubscriptionDto } from '../dtos/subscription.dto';
import { Subscription } from '../../domain/entities/subscription.entity';

export interface SubscriptionHandler {
  createSubscription(
    subscriptionDto: SubscriptionDto,
  ): Promise<{ message: string }>;

  confirmSubscription(token: string): Promise<{ message: string }>;

  removeSubscription(token: string): Promise<{ message: string }>;

  getActiveSubscriptions(frequency: Frequency): Promise<Subscription[]>;
}
