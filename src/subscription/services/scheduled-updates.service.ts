import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { formEmailContent } from '../../weather/utils/weather.utils';
import { WeatherApi } from '../../weather/interfaces/weather-api.interface';
import { Frequency } from '../../common/enums/frequency.enum';
import { Subscription } from '../entities/subscription.entity';
import { Mailer } from '../interfaces/mailer.interface';

import { SubscriptionService } from './subscription.service';

@Injectable()
export class ScheduledUpdatesService {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    @Inject('Mailer') private readonly mailer: Mailer,
    @Inject('WeatherApi') private readonly weatherApi: WeatherApi,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sendHourlyUpdates(): Promise<void> {
    const subscriptions: Subscription[] =
      await this.subscriptionService.getActiveSubscriptions(Frequency.HOURLY);
    await this.sendScheduledEmails(subscriptions);
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendDailyUpdates(): Promise<void> {
    const subscriptions: Subscription[] =
      await this.subscriptionService.getActiveSubscriptions(Frequency.DAILY);
    await this.sendScheduledEmails(subscriptions);
  }

  private async sendScheduledEmails(
    subscriptions: Subscription[],
  ): Promise<void> {
    for (const subscription of subscriptions) {
      const weather = await this.weatherApi.getCurrentWeather(
        subscription.city,
      );
      await this.mailer.sendMail(
        subscription.email,
        'Weather Update',
        formEmailContent(weather, subscription.city, subscription.token),
      );
    }
  }
}
