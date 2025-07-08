import { WeatherResponse } from '../entities/weather.interface';
import { logResponse } from '../utils/weather.utils';
import { WeatherProvider } from '../interfaces/weather-provider.interface';

export abstract class BaseWeatherHandler implements WeatherProvider {
  private nextProvider: WeatherProvider | null = null;
  public name: string;

  public getProviderName(): string {
    return this.name;
  }

  public setNext(provider: WeatherProvider): this {
    this.nextProvider = provider;
    return this;
  }

  public async getCurrentWeather(city: string): Promise<WeatherResponse> {
    try {
      const response = await this.fetch(city);
      logResponse(this.getProviderName(), response);
      return response;
    } catch (err) {
      if (this.nextProvider) {
        return this.nextProvider.getCurrentWeather(city);
      }
      throw err;
    }
  }

  protected abstract fetch(city: string): Promise<WeatherResponse>;
}
