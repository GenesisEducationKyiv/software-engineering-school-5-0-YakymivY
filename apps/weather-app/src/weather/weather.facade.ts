import { Injectable } from '@nestjs/common';

import { WeatherResponse } from './domain/entities/weather.interface';
import { WeatherService } from './application/services/weather.service';
import { WeatherApi } from './domain/interfaces/weather-api.interface';

@Injectable()
export class WeatherFacade implements WeatherApi {
  constructor(private readonly weatherService: WeatherService) {}

  getCurrentWeather(city: string): Promise<WeatherResponse> {
    return this.weatherService.getCityWeather(city);
  }
}
