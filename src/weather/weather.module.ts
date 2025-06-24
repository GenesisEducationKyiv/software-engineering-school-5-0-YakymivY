import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { SubscriptionModule } from '../subscription/subscription.module';

import { WeatherService } from './services/weather.service';
import { WeatherController } from './controllers/weather.controller';

@Module({
  imports: [HttpModule, SubscriptionModule],
  providers: [
    WeatherService,
    {
      provide: 'WeatherApi',
      useClass: WeatherService,
    },
  ],
  controllers: [WeatherController],
  exports: ['WeatherApi'],
})
export class WeatherModule {}
