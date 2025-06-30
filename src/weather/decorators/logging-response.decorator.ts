import { WeatherResponse } from '../interfaces/weather.interface';
import { fileLogger } from '../../../logger.file';
import { WeatherProvider } from '../interfaces/weather-provider.interface';

export class LoggingResponseDecorator implements WeatherProvider {
  constructor(private readonly weatherProvider: WeatherProvider) {}

  public getProviderName(): string {
    return this.weatherProvider.getProviderName();
  }

  public setNext(next: WeatherProvider): this {
    this.weatherProvider.setNext(next);
    return this;
  }

  public async getCurrentWeather(city: string): Promise<WeatherResponse> {
    const response = await this.weatherProvider.getCurrentWeather(city);
    this.logResponse(response);
    return response;
  }

  private logResponse(response: WeatherResponse): void {
    fileLogger.info(`${this.getProviderName()}: ${JSON.stringify(response)}`);
  }
}
