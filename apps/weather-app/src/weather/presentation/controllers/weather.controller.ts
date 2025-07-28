import { Controller, Get, Query, Inject } from '@nestjs/common';

import { WeatherResponse } from '../../domain/entities/weather.interface';
import { CityDto } from '../../application/dtos/city.dto';
import { WeatherApi } from '../../domain/interfaces/weather-api.interface';

@Controller('weather')
export class WeatherController {
  constructor(@Inject('WeatherApi') private readonly weatherApi: WeatherApi) {}

  @Get()
  async getWeather(@Query() cityDto: CityDto): Promise<WeatherResponse> {
    return this.weatherApi.getCurrentWeather(cityDto.city);
  }
}
