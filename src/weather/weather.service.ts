import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';

import { SubscriptionService } from '../subscription/subscription.service';
import { MailService } from '../subscription/mail.service';
import { Subscription } from '../subscription/entities/subscription.entity';
import { Frequency } from '../common/enums/frequency.enum';

import { WeatherResponse } from './interfaces/weather.interface';
import { formEmailContent } from './utils/weather.utils';

@Injectable()
export class WeatherService {
  constructor(
    private readonly httpService: HttpService,
    private readonly subscriptionService: SubscriptionService,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sendHourlyUpdates(): Promise<void> {
    const subscriptions = await this.subscriptionService.getActiveSubscriptions(
      Frequency.HOURLY,
    );
    await this.sendScheduledEmails(subscriptions);
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendDailyUpdates(): Promise<void> {
    const subscriptions = await this.subscriptionService.getActiveSubscriptions(
      Frequency.DAILY,
    );
    await this.sendScheduledEmails(subscriptions);
  }

  private async sendScheduledEmails(
    subscriptions: Subscription[],
  ): Promise<void> {
    for (const subscription of subscriptions) {
      const weather = await this.getWeather(subscription.city);
      await this.mailService.sendMail(
        subscription.email,
        'Weather Update',
        formEmailContent(weather, subscription.city, subscription.token),
      );
    }
  }

  async getWeather(city: string): Promise<WeatherResponse> {
    try {
      const apiKey = process.env.WEATHER_API_KEY;
      const url = `https://api.weatherapi.com/v1/current.json?q=${city}&key=${apiKey}`;
      const response = await lastValueFrom(this.httpService.get(url));
      const data = response.data as {
        current: {
          temp_c: number;
          humidity: number;
          condition: { text: string };
        };
      };
      const weather: WeatherResponse = {
        temperature: data.current.temp_c,
        humidity: data.current.humidity,
        description: data.current.condition.text,
      };
      return weather;
    } catch (error) {
      if (error.response.data.error.code === 1006) {
        throw new NotFoundException('City not found');
      } else {
        throw new BadRequestException(`Invalid request`);
      }
    }
  }
}
