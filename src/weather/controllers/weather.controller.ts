<<<<<<< HEAD
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
=======
import { Controller, Get, Query, Inject } from '@nestjs/common';
>>>>>>> dc12e32 (dependency inversion for mail and weather services)

import { WeatherResponse } from '../../weather/interfaces/weather.interface';
import { CityDto } from '../../weather/dtos/city.dto';
import { WeatherApi } from '../../weather/interfaces/weather-api.interface';

@Controller('weather')
export class WeatherController {
  constructor(@Inject('WeatherApi') private readonly weatherApi: WeatherApi) {}

  @Get()
  async getWeather(@Query() cityDto: CityDto): Promise<WeatherResponse> {
<<<<<<< HEAD
    return this.weatherService.getWeather(cityDto.city);
>>>>>>> c797021 (scheduled updates separated & folder structure changed)
=======
    return this.weatherApi.getCurrentWeather(cityDto.city);
>>>>>>> dc12e32 (dependency inversion for mail and weather services)
  }
}
