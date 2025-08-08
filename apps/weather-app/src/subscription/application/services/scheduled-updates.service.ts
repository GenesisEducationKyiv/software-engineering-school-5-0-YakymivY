import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { Frequency } from '../../../common/enums/frequency.enum';
import { Subscription } from '../../domain/entities/subscription.entity';
import { WeatherApi } from '../../../weather/domain/interfaces/weather-api.interface';
import { MailService } from '../../infrastructure/interfaces/mail-service.interface';

import { SubscriptionService } from './subscription.service';

@Injectable()
export class ScheduledUpdatesService {
  private readonly logger = new Logger(ScheduledUpdatesService.name);

  constructor(
    @Inject('SubscriptionService')
    private readonly subscriptionService: SubscriptionService,
    @Inject('WeatherApi') private readonly weatherApi: WeatherApi,
    @Inject('MailService') private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sendHourlyUpdates(): Promise<void> {
    this.logger.log({
      message: 'Hourly updates requested successfully',
    });
    const subscriptions: Subscription[] =
      await this.subscriptionService.getActiveSubscriptions(Frequency.HOURLY);
    await this.sendScheduledEmails(subscriptions);
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendDailyUpdates(): Promise<void> {
    this.logger.log({
      message: 'Daily updates requested successfully',
    });
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
      await this.mailService.sendWeatherUpdateEmail({
        weather,
        subscription,
      });

      this.logger.log({
        userId: subscription.id,
        email: subscription.email,
        city: subscription.city,
        message: 'Weather update email requested successfully',
      });
    }
  }
}
