import { Controller, Get, Query } from '@nestjs/common';

import { WeatherResponse } from './interfaces/weather.interface';
import { WeatherService } from './weather.service';
import { CityDto } from './dtos/city.dto';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  async getWeather(@Query() cityDto: CityDto): Promise<WeatherResponse> {
    return this.weatherService.getWeather(cityDto.city);
  }
}
