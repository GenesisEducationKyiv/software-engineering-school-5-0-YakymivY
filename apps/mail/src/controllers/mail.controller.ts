import { Controller } from '@nestjs/common';

import {
  MailServiceController,
  MailServiceControllerMethods,
  SendConfirmationEmailRequest,
  SendConfirmationEmailResponse,
} from '@app/common';

import { MailBuilderService } from '../services/mail-builder.service';

@Controller()
@MailServiceControllerMethods()
export class MailController implements MailServiceController {
  constructor(private readonly mailBuilderService: MailBuilderService) {}

  async sendConfirmationEmail(
    confirmationData: SendConfirmationEmailRequest,
  ): Promise<SendConfirmationEmailResponse> {
    return {
      success:
        await this.mailBuilderService.sendConfirmationEmail(confirmationData),
    };
  }
}
