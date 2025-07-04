import { HandlerResponse } from '../interfaces/weather.interface';

export interface WeatherProvider {
  getProviderName(): string;
  setNext(provider: WeatherProvider): this;
  getCurrentWeather(city: string): Promise<HandlerResponse>;
}
