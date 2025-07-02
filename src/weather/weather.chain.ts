import { Injectable, OnModuleInit } from '@nestjs/common';

import { WeatherProvider } from './handlers/weather-provider.interface';
import { WeatherApiHandler } from './handlers/weather-api.handler';
import { OpenWeatherMapHandler } from './handlers/openweathermap.handler';
import { LoggingResponseDecorator } from './handlers/logging-response.decorator';

@Injectable()
export class WeatherChain implements OnModuleInit {
  public handler: WeatherProvider;

  constructor(
    private readonly WeatherApiHandler: WeatherApiHandler,
    private readonly OpenWeatherMapHandler: OpenWeatherMapHandler,
  ) {}

  onModuleInit(): void {
    this.WeatherApiHandler.setNext(this.OpenWeatherMapHandler);
    this.handler = new LoggingResponseDecorator(this.WeatherApiHandler);
  }
}
