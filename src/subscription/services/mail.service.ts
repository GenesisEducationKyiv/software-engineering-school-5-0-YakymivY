import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

import { Mailer } from '../interfaces/mailer.interface';

import { Mailer } from '../interfaces/mailer.interface';

@Injectable()
export class MailService implements Mailer {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);
  private readonly mailUser: string;
  private readonly mailPass: string;

  constructor(private configService: ConfigService) {
    this.mailUser = this.configService.getOrThrow<string>('MAIL_USER');
    this.mailPass = this.configService.getOrThrow<string>('MAIL_PASS');

    if (!this.mailUser || !this.mailPass) {
      throw new Error('Missing MAIL_USER or MAIL_PASS environment variable');
    }

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: this.mailUser,
        pass: this.mailPass,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Weather App" <${this.mailUser}>`,
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
