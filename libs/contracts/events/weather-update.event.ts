import { SubscriptionPayload } from '../../../apps/weather-app/src/subscription/domain/interfaces/subscription-payload.interface';
import { WeatherResponse } from '../../../apps/weather-app/src/weather/domain/entities/weather.interface';

export interface WeatherUpdateEvent {
  weather: WeatherResponse;
  subscription: SubscriptionPayload;
}
