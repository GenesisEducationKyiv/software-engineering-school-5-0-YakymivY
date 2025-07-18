import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Mailer } from '../../infrastructure/interfaces/mailer.interface';
import { formEmailContent } from '../../../common/utils/weather/weather.utils';
import { WeatherResponse } from '../../../weather/domain/entities/weather.interface';
import { Subscription } from '../../domain/entities/subscription.entity';

@Injectable()
export class MailBuilderService {
  private readonly logger = new Logger(MailBuilderService.name);
  private readonly baseUrl: string;

  constructor(
    @Inject('Mailer') private readonly mailer: Mailer,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('BASE_URL');
  }

  async sendConfirmationEmail(email: string, token: string): Promise<void> {
    try {
      await this.mailer.sendMail(
        email,
        'Weather Subscription',
        `<p>Thanks for subscribing!</p><p>Click the link below to confirm:</p><a href="${this.baseUrl}/confirm/${token}">Confirm Subscription</a>`,
      );
    } catch (error) {
      this.logger.error('Error sending confirmation email: ', error);
    }
  }

  async sendWeatherUpdateEmail(
    weather: WeatherResponse,
    subscription: Subscription,
  ): Promise<void> {
    try {
      await this.mailer.sendMail(
        subscription.email,
        'Weather Update',
        formEmailContent(weather, subscription.city, subscription.token),
      );
    } catch (error) {
      this.logger.error('Error sending weather update email: ', error);
    }
  }
}
