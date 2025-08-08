import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { formEmailContent } from '../common/mail.utils';
import { Mailer } from '../interfaces/mailer.interface';
import { MailBuilder } from '../interfaces/mail-builder.interface';
import { ConfirmationPayload } from '../interfaces/confirmation-payload.interface';
import { WeatherPayload } from '../interfaces/weather-payload.interface';
import { MetricsService } from '../common/services/metrics/metrics.service';

@Injectable()
export class MailBuilderService implements MailBuilder {
  private readonly logger = new Logger(MailBuilderService.name);
  private readonly baseUrl: string;

  constructor(
    @Inject('Mailer') private readonly mailer: Mailer,
    private configService: ConfigService,
    @Inject('MetricsService') private metricsService: MetricsService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('BASE_URL');
  }

  async sendConfirmationEmail(
    confirmationData: ConfirmationPayload,
  ): Promise<boolean> {
    const { email, token } = confirmationData;
    try {
      await this.mailer.sendMail(
        email,
        'Weather Subscription',
        `<p>Thanks for subscribing!</p><p>Click the link below to confirm:</p><a href="${this.baseUrl}/confirm/${token}">Confirm Subscription</a>`,
      );
      this.metricsService.trackMailRequest('confirm');
      return true;
    } catch (error) {
      this.logger.error({
        email,
        message: 'Error sending confirmation email',
        error,
      });
      return false;
    }
  }

  async sendWeatherUpdateEmail(weatherData: WeatherPayload): Promise<boolean> {
    const { weather, subscription } = weatherData;
    try {
      await this.mailer.sendMail(
        subscription.email,
        'Weather Update',
        formEmailContent(weather, subscription.city, subscription.token),
      );
      this.metricsService.trackMailRequest('weather');
      return true;
    } catch (error) {
      this.logger.error({
        email: subscription.email,
        city: subscription.city,
        message: 'Error sending weather update email',
        error,
      });
      return false;
    }
  }
}
