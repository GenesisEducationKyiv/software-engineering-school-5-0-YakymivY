import { WeatherResponse } from '../entities/weather.interface';

export interface WeatherApi {
  getCurrentWeather(city: string): Promise<WeatherResponse>;
}
