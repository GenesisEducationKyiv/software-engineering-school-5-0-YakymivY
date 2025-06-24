import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  Param,
  Get,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

import { SubscriptionDto } from '../dtos/subscription.dto';
import { SubscriptionService } from '../services/subscription.service';
import { TokenDto } from '../dtos/token.dto';
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

  @Get('confirm/:token')
  async confirmSubscription(
    @Param() tokenDto: TokenDto,
  ): Promise<{ message: string }> {
    return this.subscriptionService.confirmSubscription(tokenDto.token);
  }

  @Get('unsubscribe/:token')
  async unsubscribe(@Param() tokenDto: TokenDto): Promise<{ message: string }> {
    return this.subscriptionService.removeSubscription(tokenDto.token);
  }
}
