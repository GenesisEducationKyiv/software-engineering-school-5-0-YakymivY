import { Inject, Controller } from '@nestjs/common';

import {
  MailServiceController,
  MailServiceControllerMethods,
  SendConfirmationEmailRequest,
  SendConfirmationEmailResponse,
  SendWeatherUpdateEmailRequest,
  SendWeatherUpdateEmailResponse,
} from '@app/common';

import { MailBuilder } from '../interfaces/mail-builder.interface';

@Controller()
@MailServiceControllerMethods()
export class MailController implements MailServiceController {
  constructor(
    @Inject('MailBuilder')
    private readonly mailBuilderService: MailBuilder,
  ) {}

  async sendConfirmationEmail(
    confirmationData: SendConfirmationEmailRequest,
  ): Promise<SendConfirmationEmailResponse> {
    return {
      success:
        await this.mailBuilderService.sendConfirmationEmail(confirmationData),
    };
  }

  async sendWeatherUpdateEmail(
    weatherData: SendWeatherUpdateEmailRequest,
  ): Promise<SendWeatherUpdateEmailResponse> {
    return {
      success:
        await this.mailBuilderService.sendWeatherUpdateEmail(weatherData),
    };
  }
}
