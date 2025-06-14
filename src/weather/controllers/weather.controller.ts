import { Controller, Get, Query, Inject } from '@nestjs/common';

import { WeatherResponse } from '../../weather/interfaces/weather.interface';
import { CityDto } from '../../weather/dtos/city.dto';
import { WeatherApi } from '../../weather/interfaces/weather-api.interface';

@Controller('weather')
export class WeatherController {
  constructor(@Inject('WeatherApi') private readonly weatherApi: WeatherApi) {}

  @Get()
  async getWeather(@Query() cityDto: CityDto): Promise<WeatherResponse> {
    return this.weatherApi.getCurrentWeather(cityDto.city);
  }
}
