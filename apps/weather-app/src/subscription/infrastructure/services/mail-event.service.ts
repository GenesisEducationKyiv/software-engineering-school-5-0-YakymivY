import { Injectable, Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

import { WeatherUpdateEvent } from 'libs/contracts/events/weather-update.event';
import { UserSubscribedEvent } from 'libs/contracts/events/user-subscribed.event';

import { MailService } from '../interfaces/mail-service.interface';

@Injectable()
export class MailEventService implements MailService {
  constructor(
    @Inject('MAIL_EVENT') private readonly mailEventClient: ClientProxy,
  ) {}

  async sendConfirmationEmail(
    confirmationData: UserSubscribedEvent,
  ): Promise<void> {
    await firstValueFrom(
      this.mailEventClient.emit('user.subscribed', confirmationData),
    );
  }

  async sendWeatherUpdateEmail(weatherData: WeatherUpdateEvent): Promise<void> {
    await firstValueFrom(
      this.mailEventClient.emit('weather.update', weatherData),
    );
  }
}
