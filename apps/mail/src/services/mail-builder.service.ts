import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  SendConfirmationEmailRequest,
  SendWeatherUpdateEmailRequest,
} from '@app/common';

import { formEmailContent } from '../common/mail.utils';
import { Mailer } from '../interfaces/mailer.interface';
import { MailBuilder } from '../interfaces/mail-builder.interface';

@Injectable()
export class MailBuilderService implements MailBuilder {
  private readonly logger = new Logger(MailBuilderService.name);
  private readonly baseUrl: string;

  constructor(
    @Inject('Mailer') private readonly mailer: Mailer,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('BASE_URL');
  }

  async sendConfirmationEmail(
    confirmationData: SendConfirmationEmailRequest,
  ): Promise<boolean> {
    const { email, token } = confirmationData;
    try {
      await this.mailer.sendMail(
        email,
        'Weather Subscription',
        `<p>Thanks for subscribing!</p><p>Click the link below to confirm:</p><a href="${this.baseUrl}/confirm/${token}">Confirm Subscription</a>`,
      );
      return true;
    } catch (error) {
      this.logger.error('Error sending confirmation email: ', error);
      return false;
    }
  }

  async sendWeatherUpdateEmail(
    weatherData: SendWeatherUpdateEmailRequest,
  ): Promise<boolean> {
    const { weather, subscription } = weatherData;
    try {
      await this.mailer.sendMail(
        subscription.email,
        'Weather Update',
        formEmailContent(weather, subscription.city, subscription.token),
      );
      return true;
    } catch (error) {
      this.logger.error('Error sending weather update email: ', error);
      return false;
    }
  }
}
