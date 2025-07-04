import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

import { HandlerResponse } from '../interfaces/weather.interface';

import { BaseWeatherHandler } from './base-weather.handler';

@Injectable()
export class OpenWeatherMapHandler extends BaseWeatherHandler {
  private readonly openWeatherApiKey: string;

  constructor(
    private http: HttpService,
    private configService: ConfigService,
  ) {
    super();
    this.openWeatherApiKey = this.configService.getOrThrow<string>(
      'OPENWEATHERMAP_API_KEY',
    );
    this.name = 'openweathermap.org';
  }

  protected async fetch(city: string): Promise<HandlerResponse> {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.openWeatherApiKey}`;
      const response = await lastValueFrom(this.http.get(url));
      const data = response.data as {
        main: {
          temp: number;
          humidity: number;
        };
        weather: { description: string }[];
      };
      const weather: HandlerResponse = {
        provider: this.name,
        weather: {
          temperature: data.main.temp,
          humidity: data.main.humidity,
          description: data.weather[0].description,
        },
      };
      return weather;
    } catch (error) {
      if (error.response?.data?.cod === 404) {
        throw new NotFoundException('City not found');
      } else {
        throw new InternalServerErrorException('Failed to fetch weather data');
      }
    }
  }
}
