import { UserSubscribedEvent } from 'libs/contracts/events/user-subscribed.event';
import { WeatherUpdateEvent } from 'libs/contracts/events/weather-update.event';

export interface MailService {
  sendConfirmationEmail(confirmationData: UserSubscribedEvent): Promise<void>;
  sendWeatherUpdateEmail(weatherData: WeatherUpdateEvent): Promise<void>;
}
