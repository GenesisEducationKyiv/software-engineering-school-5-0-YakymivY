<<<<<<< HEAD
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
=======
import { Controller, Get, Query } from '@nestjs/common';

import { WeatherResponse } from '../../weather/interfaces/weather.interface';
import { WeatherService } from '../../weather/services/weather.service';
import { CityDto } from '../../weather/dtos/city.dto';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  async getWeather(@Query() cityDto: CityDto): Promise<WeatherResponse> {
    return this.weatherService.getWeather(cityDto.city);
>>>>>>> c797021 (scheduled updates separated & folder structure changed)
  }
}
