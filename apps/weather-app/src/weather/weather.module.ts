import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { CommonModule } from '../common/common.module';
import { SubscriptionModule } from '../subscription/subscription.module';

import { WeatherService } from './application/services/weather.service';
import { WeatherController } from './presentation/controllers/weather.controller';
import { WeatherChain } from './infrastructure/chains/weather.chain';
import { WeatherApiHandler } from './infrastructure/external-services/weatherapi/weather-api.handler';
import { OpenWeatherMapHandler } from './infrastructure/external-services/openweathermap/openweathermap.handler';
import { WeatherFacade } from './weather.facade';

@Module({
  imports: [HttpModule, forwardRef(() => SubscriptionModule), CommonModule],
  providers: [
    WeatherService,
    {
      provide: 'WeatherApi',
      useClass: WeatherFacade,
    },
    WeatherChain,
    WeatherApiHandler,
    OpenWeatherMapHandler,
    WeatherFacade,
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
