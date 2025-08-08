import {
  Inject,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

import { WeatherResponse } from '../../../domain/entities/weather.interface';
import { BaseWeatherHandler } from '../../chains/base-weather.handler';
import { MetricsService } from '../../../../common/services/metrics.service';

@Injectable()
export class WeatherApiHandler extends BaseWeatherHandler {
  private readonly weatherApiKey: string;

  constructor(
    private http: HttpService,
    private configService: ConfigService,
    @Inject('MetricsService') private readonly metrics: MetricsService,
  ) {
    super();
    this.name = 'weatherapi.com';
    this.weatherApiKey =
      this.configService.getOrThrow<string>('WEATHER_API_KEY');
  }

  protected async fetch(city: string): Promise<WeatherResponse> {
    try {
      const url = `https://api.weatherapi.com/v1/current.json?q=${city}&key=${this.weatherApiKey}`;
      const response = await lastValueFrom(this.http.get(url));
      this.metrics.trackApiCall();
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
        throw new InternalServerErrorException('Failed to fetch weather');
      }
    }
  }
}
