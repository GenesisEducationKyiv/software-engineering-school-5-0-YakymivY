import { Controller, Get, Query } from '@nestjs/common';
import { WeatherResponse } from './interfaces/weather.interface';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  async getWeather(@Query('city') city: string): Promise<WeatherResponse> {
    return this.weatherService.getWeather(city);
  }
}
