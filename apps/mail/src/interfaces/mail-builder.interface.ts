import {
  SendConfirmationEmailRequest,
  SendWeatherUpdateEmailRequest,
} from '@app/common';

export interface MailBuilder {
  sendConfirmationEmail(
    confirmationData: SendConfirmationEmailRequest,
  ): Promise<boolean>;
  sendWeatherUpdateEmail(
    weatherData: SendWeatherUpdateEmailRequest,
  ): Promise<boolean>;
}
