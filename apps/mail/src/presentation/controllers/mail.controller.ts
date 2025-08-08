import { Inject, Controller, Logger } from '@nestjs/common';

import {
  MailServiceController,
  MailServiceControllerMethods,
  SendConfirmationEmailRequest,
  SendConfirmationEmailResponse,
  SendWeatherUpdateEmailRequest,
  SendWeatherUpdateEmailResponse,
} from '@app/common';

import { MailBuilder } from '../../application/interfaces/mail-builder.interface';

@Controller()
@MailServiceControllerMethods()
export class MailController implements MailServiceController {
  private readonly logger = new Logger(MailController.name);

  constructor(
    @Inject('MailBuilder')
    private readonly mailBuilderService: MailBuilder,
  ) {}

  async sendConfirmationEmail(
    confirmationData: SendConfirmationEmailRequest,
  ): Promise<SendConfirmationEmailResponse> {
    this.logger.log({
      email: confirmationData.email,
      message: 'Confirmation email request received in mail microservice',
    });
    return {
      success:
        await this.mailBuilderService.sendConfirmationEmail(confirmationData),
    };
  }

  async sendWeatherUpdateEmail(
    weatherData: SendWeatherUpdateEmailRequest,
  ): Promise<SendWeatherUpdateEmailResponse> {
    this.logger.log({
      email: weatherData.subscription.email,
      city: weatherData.subscription.city,
      message: 'Weather update email request received in mail microservice',
    });
    return {
      success:
        await this.mailBuilderService.sendWeatherUpdateEmail(weatherData),
    };
  }
}
