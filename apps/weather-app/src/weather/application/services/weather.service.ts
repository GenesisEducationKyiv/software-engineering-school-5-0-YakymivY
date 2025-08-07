import { Injectable } from '@nestjs/common';

import { WeatherResponse } from '../../domain/entities/weather.interface';
import { WeatherChain } from '../../infrastructure/chains/weather.chain';

@Injectable()
export class WeatherService {
  constructor(private readonly weatherChain: WeatherChain) {}

  async getCityWeather(city: string): Promise<WeatherResponse> {
    const response = await this.weatherChain.handler.getCurrentWeather(city);
    return response;
  }
}
