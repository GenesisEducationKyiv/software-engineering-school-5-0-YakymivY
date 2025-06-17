import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

import { Mailer } from '../interfaces/mailer.interface';

@Injectable()
export class MailService implements Mailer {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.getOrThrow<string>('MAIL_USER'),
        pass: this.configService.getOrThrow<string>('MAIL_PASS'),
      },
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Weather App" <${this.configService.getOrThrow<string>('MAIL_USER')}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error('Error sending mail: ', (error as Error).message);
      throw new InternalServerErrorException('Failed to send mail');
    }
  }
}
