import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  Param,
  Get,
} from '@nestjs/common';
import { SubscriptionDto } from './dtos/subscription.dto';
import { SubscriptionService } from './subscription.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { TokenDto } from './dtos/token.dto';
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
  async confirmSubscription(@Param() tokenDto: TokenDto) {
    return this.subscriptionService.confirmSubscription(tokenDto.token);
  }

  @Get('unsubscribe/:token')
  async unsubscribe(@Param() tokenDto: TokenDto) {
    return this.subscriptionService.removeSubscription(tokenDto.token);
  }
}
