import { HandlerResponse } from '../interfaces/weather.interface';
import { fileLogger } from '../../../logger.file';

import { WeatherProvider } from './weather-provider.interface';

export class LoggingResponseDecorator implements WeatherProvider {
  constructor(private readonly weatherProvider: WeatherProvider) {}

  public getProviderName(): string {
    return this.weatherProvider.getProviderName();
  }

  public setNext(next: WeatherProvider): this {
    this.weatherProvider.setNext(next);
    return this;
  }

  public async getCurrentWeather(city: string): Promise<HandlerResponse> {
    const response = await this.weatherProvider.getCurrentWeather(city);
    this.logResponse(response);
    return response;
  }

  private logResponse(response: HandlerResponse): void {
    fileLogger.info(
      `${response.provider}: ${JSON.stringify(response.weather)}`,
    );
  }
}
