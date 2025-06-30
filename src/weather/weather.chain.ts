import { Injectable, OnModuleInit } from '@nestjs/common';

import { CachingService } from '../common/services/caching.service';

import { WeatherProvider } from './interfaces/weather-provider.interface';
import { ProviderPrimaryHandler } from './handlers/provider-primary.handler';
import { ProviderSecondaryHandler } from './handlers/provider-secondary.handler';
import { LoggingResponseDecorator } from './decorators/logging-response.decorator';
import { CachingResponseDecorator } from './decorators/caching-response.decorator';

@Injectable()
export class WeatherChain implements OnModuleInit {
  public handler: WeatherProvider;

  constructor(
    private readonly providerPrimaryHandler: ProviderPrimaryHandler,
    private readonly providerSecondaryHandler: ProviderSecondaryHandler,
    private readonly cachingService: CachingService,
  ) {}

  onModuleInit(): void {
    this.handler = this.buildWeatherChain();
  }

  private buildWeatherChain(): WeatherProvider {
    this.providerPrimaryHandler.setNext(this.providerSecondaryHandler);
    const logger = new LoggingResponseDecorator(this.providerPrimaryHandler);
    return new CachingResponseDecorator(logger, this.cachingService);
  }
}
