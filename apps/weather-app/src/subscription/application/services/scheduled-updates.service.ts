import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { Frequency } from '../../../common/enums/frequency.enum';
import { Subscription } from '../../domain/entities/subscription.entity';
import { WeatherApi } from '../../../weather/domain/interfaces/weather-api.interface';
import { MailClientService } from '../../infrastructure/services/mail-client.service';

import { SubscriptionService } from './subscription.service';

@Injectable()
export class ScheduledUpdatesService {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    @Inject('WeatherApi') private readonly weatherApi: WeatherApi,
    private readonly mailClientService: MailClientService,
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
      this.mailClientService.sendWeatherUpdateEmail({
        weather,
        subscription,
      });
    }
  }
}
