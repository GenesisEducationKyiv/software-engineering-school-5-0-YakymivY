import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

import { WeatherResponse } from '../interfaces/weather.interface';
import { WeatherApi } from '../interfaces/weather-api.interface';

@Injectable()
export class WeatherService implements WeatherApi {
  private readonly weatherApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.weatherApiKey =
      this.configService.getOrThrow<string>('WEATHER_API_KEY');

    if (!this.weatherApiKey) {
      throw new Error('Missing WEATHER_API_KEY environment variable');
    }
  }

  async getCurrentWeather(city: string): Promise<WeatherResponse> {
    try {
      const url = `https://api.weatherapi.com/v1/current.json?q=${city}&key=${this.weatherApiKey}`;
      const response = await lastValueFrom(this.httpService.get(url));
      const data = response.data as {
        current: {
          temp_c: number;
          humidity: number;
          condition: { text: string };
        };
      };
      const weather: WeatherResponse = {
        temperature: data.current.temp_c,
        humidity: data.current.humidity,
        description: data.current.condition.text,
      };
      return weather;
    } catch (error) {
      if (error.response.data.error.code === 1006) {
        throw new NotFoundException('City not found');
      } else {
        throw new BadRequestException(`Invalid request`);
      }
    }
  }
}
