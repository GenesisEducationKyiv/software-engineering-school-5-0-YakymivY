import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

import {
  MailServiceClient,
  SendConfirmationEmailRequest,
  SendWeatherUpdateEmailRequest,
} from '@app/common';

@Injectable()
export class MailClientService implements OnModuleInit {
  private mailService: MailServiceClient;
  private readonly logger = new Logger(MailClientService.name);

  constructor(@Inject('MAIL_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit(): void {
    this.mailService = this.client.getService<MailServiceClient>('MailService');
  }

  sendConfirmationEmail(confirmationData: SendConfirmationEmailRequest): void {
    this.mailService.sendConfirmationEmail(confirmationData).subscribe();
    this.logger.log({
      email: confirmationData.email,
      message:
        'Confirmation email request sent to mail microservice successfully',
    });
  }

  sendWeatherUpdateEmail(weatherData: SendWeatherUpdateEmailRequest): void {
    this.mailService.sendWeatherUpdateEmail(weatherData).subscribe();
    this.logger.log({
      email: weatherData.subscription.email,
      city: weatherData.subscription.city,
      message:
        'Weather update email request sent to mail microservice successfully',
    });
  }
}
