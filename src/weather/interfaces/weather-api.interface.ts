import { WeatherResponse } from './weather.interface';

export interface WeatherApi {
  getCurrentWeather(city: string): Promise<WeatherResponse>;
}
