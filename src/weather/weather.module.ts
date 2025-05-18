import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { HttpModule } from '@nestjs/axios';
import { SubscriptionModule } from 'src/subscription/subscription.module';

@Module({
  imports: [HttpModule, SubscriptionModule],
  providers: [WeatherService],
  controllers: [WeatherController],
})
export class WeatherModule {}
