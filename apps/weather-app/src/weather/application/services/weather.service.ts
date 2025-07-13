import { Injectable } from '@nestjs/common';

import { WeatherResponse } from '../../domain/entities/weather.interface';
import { WeatherApi } from '../../domain/interfaces/weather-api.interface';
import { WeatherChain } from '../../infrastructure/chains/weather.chain';

@Injectable()
export class WeatherService implements WeatherApi {
  constructor(private readonly weatherChain: WeatherChain) {}

  async getCurrentWeather(city: string): Promise<WeatherResponse> {
    const response = await this.weatherChain.handler.getCurrentWeather(city);
    return response;
  }
}
