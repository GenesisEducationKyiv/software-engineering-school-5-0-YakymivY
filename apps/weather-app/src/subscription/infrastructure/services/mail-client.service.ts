import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

import {
  MailServiceClient,
  SendConfirmationEmailRequest,
  SendWeatherUpdateEmailRequest,
} from '@app/common';

@Injectable()
export class MailClientService implements OnModuleInit {
  private mailService: MailServiceClient;

  constructor(@Inject('MAIL_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit(): void {
    this.mailService = this.client.getService<MailServiceClient>('MailService');
  }

  sendConfirmationEmail(confirmationData: SendConfirmationEmailRequest): void {
    this.mailService.sendConfirmationEmail(confirmationData).subscribe();
  }

  sendWeatherUpdateEmail(weatherData: SendWeatherUpdateEmailRequest): void {
    this.mailService.sendWeatherUpdateEmail(weatherData).subscribe();
  }
}
