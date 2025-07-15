import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SendConfirmationEmailRequest } from '@app/common';

import { Mailer } from '../interfaces/mailer.interface';

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
}
