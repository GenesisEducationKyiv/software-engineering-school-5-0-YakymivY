import { WeatherResponse } from '../entities/weather.interface';

export interface WeatherProvider {
  getProviderName(): string;
  setNext(provider: WeatherProvider): this;
  getCurrentWeather(city: string): Promise<WeatherResponse>;
}
