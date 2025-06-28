import { WeatherResponse } from '../interfaces/weather.interface';

export interface WeatherProvider {
  setNext(provider: WeatherProvider): this;
  getCurrentWeather(city: string): Promise<WeatherResponse>;
}
