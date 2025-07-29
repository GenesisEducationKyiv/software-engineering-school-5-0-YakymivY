import { Inject, Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { MailBuilder } from '../interfaces/mail-builder.interface';

@Controller('mail-event')
export class MailEventController {
  constructor(
    @Inject('MailBuilder')
    private readonly mailBuilderService: MailBuilder,
  ) {}

  @EventPattern('user.subscribed')
  async onUserSubscribed(
    @Payload() confirmationData: { email: string; token: string },
  ): Promise<void> {
    await this.mailBuilderService.sendConfirmationEmail(confirmationData);
  }
}
