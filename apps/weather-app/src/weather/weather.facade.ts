import { Injectable, Logger } from '@nestjs/common';

import { WeatherResponse } from './domain/entities/weather.interface';
import { WeatherService } from './application/services/weather.service';
import { WeatherApi } from './domain/interfaces/weather-api.interface';

@Injectable()
export class WeatherFacade implements WeatherApi {
  private readonly logger = new Logger(WeatherFacade.name);

  constructor(private readonly weatherService: WeatherService) {}

  getCurrentWeather(city: string): Promise<WeatherResponse> {
    this.logger.log({
      city,
      message: 'Weather request received',
    });
    return this.weatherService.getCityWeather(city);
  }
}
