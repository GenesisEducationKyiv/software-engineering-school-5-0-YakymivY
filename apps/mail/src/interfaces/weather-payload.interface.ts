export interface WeatherPayload {
  weather: WeatherData;
  subscription: SubscriptionData;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
}

export interface SubscriptionData {
  email: string;
  city: string;
  token: string;
}
