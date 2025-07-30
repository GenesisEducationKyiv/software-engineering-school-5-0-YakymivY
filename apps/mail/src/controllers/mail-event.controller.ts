import { Inject, Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { UserSubscribedEvent, WeatherUpdateEvent } from '@app/contracts';

import { MailBuilder } from '../interfaces/mail-builder.interface';

@Controller('mail-event')
export class MailEventController {
  constructor(
    @Inject('MailBuilder')
    private readonly mailBuilderService: MailBuilder,
  ) {}

  @EventPattern('user.subscribed')
  async onUserSubscribed(
    @Payload() confirmationData: UserSubscribedEvent,
  ): Promise<void> {
    await this.mailBuilderService.sendConfirmationEmail({
      email: confirmationData.email,
      token: confirmationData.token,
    });
  }

  @EventPattern('weather.update')
  async onWeatherUpdate(
    @Payload() weatherData: WeatherUpdateEvent,
  ): Promise<void> {
    await this.mailBuilderService.sendWeatherUpdateEmail({
      weather: weatherData.weather,
      subscription: weatherData.subscription,
    });
  }
}
