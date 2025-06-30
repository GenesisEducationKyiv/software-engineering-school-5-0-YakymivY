import { Injectable } from '@nestjs/common';

import { CachingService } from '../../common/services/caching.service';
import { WeatherProvider } from '../interfaces/weather-provider.interface';
import { WeatherResponse } from '../interfaces/weather.interface';

@Injectable()
export class CachingResponseDecorator implements WeatherProvider {
  constructor(
    private readonly weatherProvider: WeatherProvider,
    private readonly cachingService: CachingService,
  ) {}

  public getProviderName(): string {
    return this.weatherProvider.getProviderName();
  }

  public setNext(next: WeatherProvider): this {
    this.weatherProvider.setNext(next);
    return this;
  }

  public async getCurrentWeather(city: string): Promise<WeatherResponse> {
    const cacheKey = `weather:${city.toLowerCase()}`;

    const cachedResponse: WeatherResponse | null =
      await this.cachingService.get<WeatherResponse>(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await this.weatherProvider.getCurrentWeather(city);
    await this.cachingService.set(cacheKey, response, 180);
    return response;
  }
}
