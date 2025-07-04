import { Injectable, OnModuleInit } from '@nestjs/common';

// Services
import { MetricsService } from '../common/services/metrics.service';
import { CachingService } from '../common/services/caching.service';

import { WeatherProvider } from './interfaces/weather-provider.interface';
import { WeatherApiHandler } from './handlers/weather-api.handler';
import { OpenWeatherMapHandler } from './handlers/openweathermap.handler';
import { CachingResponseDecorator } from './decorators/caching-response.decorator';
import { LoggingResponseDecorator } from './decorators/logging-response.decorator';

@Injectable()
export class WeatherChain implements OnModuleInit {
  public handler: WeatherProvider;

  constructor(
    private readonly weatherApiHandler: WeatherApiHandler,
    private readonly openWeatherMapHandler: OpenWeatherMapHandler,
    private readonly cachingService: CachingService,
    private readonly metricsService: MetricsService,
  ) {}

  onModuleInit(): void {
    this.handler = this.buildWeatherChain();
  }

  private buildWeatherChain(): WeatherProvider {
    this.weatherApiHandler.setNext(this.openWeatherMapHandler);
    const logger = new LoggingResponseDecorator(this.weatherApiHandler);
    return new CachingResponseDecorator(
      logger,
      this.cachingService,
      this.metricsService,
    );
  }
}
