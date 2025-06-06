import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { SubscriptionModule } from '../subscription/subscription.module';

import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';

@Module({
  imports: [HttpModule, SubscriptionModule],
  providers: [WeatherService],
  controllers: [WeatherController],
})
export class WeatherModule {}
