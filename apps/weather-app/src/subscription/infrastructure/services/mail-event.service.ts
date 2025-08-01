import { Injectable, Inject, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

import { WeatherUpdateEvent } from 'libs/contracts/events/weather-update.event';
import { UserSubscribedEvent } from 'libs/contracts/events/user-subscribed.event';

import { MailService } from '../interfaces/mail-service.interface';

@Injectable()
export class MailEventService implements MailService {
  private readonly logger = new Logger(MailEventService.name);

  constructor(
    @Inject('MAIL_EVENT') private readonly mailEventClient: ClientProxy,
  ) {}

  async sendConfirmationEmail(
    confirmationData: UserSubscribedEvent,
  ): Promise<void> {
    await firstValueFrom(
      this.mailEventClient.emit('user.subscribed', confirmationData),
    );
    this.logger.log({
      email: confirmationData.email,
      message: 'Confirmation email event sent successfully',
    });
  }

  async sendWeatherUpdateEmail(weatherData: WeatherUpdateEvent): Promise<void> {
    await firstValueFrom(
      this.mailEventClient.emit('weather.update', weatherData),
    );
    this.logger.log({
      email: weatherData.subscription.email,
      city: weatherData.subscription.city,
      message: 'Weather update email event sent successfully',
    });
  }
}
