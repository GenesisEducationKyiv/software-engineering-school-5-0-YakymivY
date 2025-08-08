import { Inject, Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { UserSubscribedEvent, WeatherUpdateEvent } from '@app/contracts';

import { MailBuilder } from '../../application/interfaces/mail-builder.interface';

@Controller('mail-event')
export class MailEventController {
  private readonly logger = new Logger(MailEventController.name);

  constructor(
    @Inject('MailBuilder')
    private readonly mailBuilderService: MailBuilder,
  ) {}

  @EventPattern('user.subscribed')
  async onUserSubscribed(
    @Payload() confirmationData: UserSubscribedEvent,
  ): Promise<void> {
    this.logger.log({
      email: confirmationData.email,
      message: 'User subscribed event received in mail microservice',
    });
    await this.mailBuilderService.sendConfirmationEmail({
      email: confirmationData.email,
      token: confirmationData.token,
    });
  }

  @EventPattern('weather.update')
  async onWeatherUpdate(
    @Payload() weatherData: WeatherUpdateEvent,
  ): Promise<void> {
    this.logger.log({
      email: weatherData.subscription.email,
      city: weatherData.subscription.city,
      message: 'Weather update event received in mail microservice',
    });
    await this.mailBuilderService.sendWeatherUpdateEmail({
      weather: weatherData.weather,
      subscription: weatherData.subscription,
    });
  }
}
