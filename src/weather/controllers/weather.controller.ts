import { Controller, Get, Query, Inject } from '@nestjs/common';

import { WeatherResponse } from '../interfaces/weather.interface';
import { CityDto } from '../dtos/city.dto';
import { WeatherApi } from '../interfaces/weather-api.interface';

@Controller('weather')
export class WeatherController {
  constructor(@Inject('WeatherApi') private readonly weatherApi: WeatherApi) {}

  @Get()
  async getWeather(@Query() cityDto: CityDto): Promise<WeatherResponse> {
    return this.weatherApi.getCurrentWeather(cityDto.city);
  }
}
