export interface WeatherResponse {
  temperature: number;
  humidity: number;
  description: string;
}

export interface HandlerResponse {
  provider: string;
  weather: WeatherResponse;
}
