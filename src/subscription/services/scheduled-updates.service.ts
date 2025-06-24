import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { WeatherApi } from '../../weather/interfaces/weather-api.interface';
import { Frequency } from '../../common/enums/frequency.enum';
import { Subscription } from '../entities/subscription.entity';

import { MailBuilderService } from './mail-builder.service';
import { SubscriptionService } from './subscription.service';

@Injectable()
export class ScheduledUpdatesService {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    @Inject('WeatherApi') private readonly weatherApi: WeatherApi,
    private readonly mailBuilderService: MailBuilderService,
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
      await this.mailBuilderService.sendWeatherUpdateEmail(
        weather,
        subscription,
      );
    }
  }
}
