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
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async getCurrentWeather(city: string): Promise<WeatherResponse> {
    try {
      const apiKey = this.configService.getOrThrow<string>('WEATHER_API_KEY');
      const url = `https://api.weatherapi.com/v1/current.json?q=${city}&key=${apiKey}`;
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
