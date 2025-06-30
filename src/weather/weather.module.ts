import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { SubscriptionModule } from '../subscription/subscription.module';
import { CachingService } from '../common/services/caching.service';

import { WeatherService } from './services/weather.service';
import { WeatherController } from './controllers/weather.controller';
import { WeatherChain } from './weather.chain';
import { ProviderPrimaryHandler } from './handlers/provider-primary.handler';
import { ProviderSecondaryHandler } from './handlers/provider-secondary.handler';

@Module({
  imports: [HttpModule, forwardRef(() => SubscriptionModule)],
  providers: [
    WeatherService,
    {
      provide: 'WeatherApi',
      useClass: WeatherService,
    },
    WeatherChain,
    ProviderPrimaryHandler,
    ProviderSecondaryHandler,
    CachingService,
  ],
  controllers: [WeatherController],
  exports: [
    'WeatherApi',
    WeatherChain,
    ProviderPrimaryHandler,
    ProviderSecondaryHandler,
    CachingService,
  ],
})
export class WeatherModule {}
