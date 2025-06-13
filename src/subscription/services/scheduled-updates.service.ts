import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { formEmailContent } from '../../weather/utils/weather.utils';
import { WeatherService } from '../../weather/services/weather.service';
import { Frequency } from '../../common/enums/frequency.enum';
import { Subscription } from '../entities/subscription.entity';

import { SubscriptionService } from './subscription.service';
import { MailService } from './mail.service';

@Injectable()
export class ScheduledUpdatesService {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly mailService: MailService,
    private readonly weatherService: WeatherService,
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
      const weather = await this.weatherService.getWeather(subscription.city);
      await this.mailService.sendMail(
        subscription.email,
        'Weather Update',
        formEmailContent(weather, subscription.city, subscription.token),
      );
    }
  }
}
