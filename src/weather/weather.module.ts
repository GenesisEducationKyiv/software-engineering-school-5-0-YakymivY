import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { SubscriptionModule } from '../subscription/subscription.module';

import { WeatherService } from './services/weather.service';
import { WeatherController } from './controllers/weather.controller';
import { WeatherChain } from './weather.chain';
import { WeatherApiHandler } from './handlers/weather-api.handler';
import { OpenWeatherMapHandler } from './handlers/openweathermap.handler';

@Module({
  imports: [HttpModule, forwardRef(() => SubscriptionModule)],
  providers: [
    WeatherService,
    {
      provide: 'WeatherApi',
      useClass: WeatherService,
    },
    WeatherChain,
    WeatherApiHandler,
    OpenWeatherMapHandler,
  ],
  controllers: [WeatherController],
  exports: [
    'WeatherApi',
    WeatherChain,
    WeatherApiHandler,
    OpenWeatherMapHandler,
  ],
})
export class WeatherModule {}
