import { HandlerResponse } from '../interfaces/weather.interface';

import { WeatherProvider } from './weather-provider.interface';

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

  public async getCurrentWeather(city: string): Promise<HandlerResponse> {
    try {
      const response = await this.fetch(city);
      response.provider = this.getProviderName();
      return response;
    } catch (err) {
      if (this.nextProvider) {
        return this.nextProvider.getCurrentWeather(city);
      }
      throw err;
    }
  }

  protected abstract fetch(city: string): Promise<HandlerResponse>;
}
