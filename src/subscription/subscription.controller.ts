import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { SubscriptionDto } from './dtos/subscription.dto';
import { SubscriptionService } from './subscription.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe')
  @UseInterceptors(AnyFilesInterceptor())
  async createSubscription(
    @Body() subscriptionDto: SubscriptionDto,
  ): Promise<{ message: string }> {
    return this.subscriptionService.createSubscription(subscriptionDto);
  }
}
