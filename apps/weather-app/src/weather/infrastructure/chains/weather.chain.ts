import { Injectable, OnModuleInit } from '@nestjs/common';

// Services
import { MetricsService } from '../../../common/services/metrics.service';
import { CachingService } from '../../../common/services/caching.service';
import { WeatherProvider } from '../../domain/interfaces/weather-provider.interface';
import { WeatherApiHandler } from '../external-services/weatherapi/weather-api.handler';
import { OpenWeatherMapHandler } from '../external-services/openweathermap/openweathermap.handler';

import { CachingResponseDecorator } from './caching-response.decorator';

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
    return new CachingResponseDecorator(
      this.weatherApiHandler,
      this.cachingService,
      this.metricsService,
    );
  }
}
