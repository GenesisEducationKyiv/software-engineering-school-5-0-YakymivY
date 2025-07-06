import { Injectable } from '@nestjs/common';

import { CachingService } from '../../common/services/caching.service';
import { WeatherProvider } from '../interfaces/weather-provider.interface';
import { HandlerResponse } from '../interfaces/weather.interface';
import { MetricsService } from '../../common/services/metrics.service';

@Injectable()
export class CachingResponseDecorator implements WeatherProvider {
  constructor(
    private readonly weatherProvider: WeatherProvider,
    private readonly cachingService: CachingService,
    private readonly metrics: MetricsService,
  ) {}

  public getProviderName(): string {
    return this.weatherProvider.getProviderName();
  }

  public setNext(next: WeatherProvider): this {
    this.weatherProvider.setNext(next);
    return this;
  }

  public async getCurrentWeather(city: string): Promise<HandlerResponse> {
    const cacheKey = `weather:${city.toLowerCase()}`;

    const cachedResponse: HandlerResponse | null =
      await this.cachingService.get<HandlerResponse>(cacheKey);
    if (cachedResponse) {
      this.metrics.trackCacheRequest('hit');
      return cachedResponse;
    }

    this.metrics.trackCacheRequest('miss');
    const response = await this.weatherProvider.getCurrentWeather(city);
    await this.cachingService.set(cacheKey, response, 180);
    return response;
  }
}
