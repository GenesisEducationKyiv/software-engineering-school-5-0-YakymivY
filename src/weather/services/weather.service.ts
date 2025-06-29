import { Injectable } from '@nestjs/common';

import { WeatherResponse } from '../interfaces/weather.interface';
import { WeatherApi } from '../interfaces/weather-api.interface';
import { WeatherChain } from '../weather.chain';

@Injectable()
export class WeatherService implements WeatherApi {
  constructor(private readonly weatherChain: WeatherChain) {}

  async getCurrentWeather(city: string): Promise<WeatherResponse> {
    return this.weatherChain.handler.getCurrentWeather(city);
  }
}
