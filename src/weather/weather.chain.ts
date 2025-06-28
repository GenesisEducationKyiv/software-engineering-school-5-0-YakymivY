import { Injectable, OnModuleInit } from '@nestjs/common';

import { WeatherProvider } from './handlers/weather-provider.interface';
import { ProviderPrimaryHandler } from './handlers/provider-primary.handler';
import { ProviderSecondaryHandler } from './handlers/provider-secondary.handler';

@Injectable()
export class WeatherChain implements OnModuleInit {
  public handler: WeatherProvider;

  constructor(
    private readonly providerPrimaryHandler: ProviderPrimaryHandler,
    private readonly providerSecondaryHandler: ProviderSecondaryHandler,
  ) {}

  onModuleInit(): void {
    this.providerPrimaryHandler.setNext(this.providerSecondaryHandler);
    this.handler = this.providerPrimaryHandler;
  }
}
