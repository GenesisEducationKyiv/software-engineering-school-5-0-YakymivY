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
<<<<<<< HEAD
  exports: ['WeatherApi'],
=======
  exports: [WeatherService],
>>>>>>> c797021 (scheduled updates separated & folder structure changed)
})
export class WeatherModule {}
