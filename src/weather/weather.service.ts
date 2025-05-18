import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { WeatherResponse } from './interfaces/weather.interface';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Frequency } from 'src/common/enums/frequency.enum';
import { Subscription } from 'src/subscription/entities/subscription.entity';
import { MailService } from 'src/subscription/mail.service';
@Injectable()
export class WeatherService {
  constructor(
    private readonly httpService: HttpService,
    private readonly subscriptionService: SubscriptionService,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sendHourlyUpdates() {
    const subscriptions = await this.subscriptionService.getActiveSubscriptions(
      Frequency.HOURLY,
    );
    await this.sendScheduledEmails(subscriptions);
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendDailyUpdates() {
    const subscriptions = await this.subscriptionService.getActiveSubscriptions(
      Frequency.DAILY,
    );
    await this.sendScheduledEmails(subscriptions);
  }

  private async sendScheduledEmails(subscriptions: Subscription[]) {
    for (const subscription of subscriptions) {
      const weather = await this.getWeather(subscription.city);
      await this.mailService.sendMail(
        subscription.email,
        'Weather Update',
        this.formEmailContent(weather, subscription.city, subscription.token),
      );
    }
  }

  async getWeather(city: string): Promise<WeatherResponse> {
    try {
      const apiKey = process.env.WEATHER_API_KEY;
      const url = `https://api.weatherapi.com/v1/current.json?q=${city}&key=${apiKey}`;
      const response = await lastValueFrom(this.httpService.get(url));
      const weather: WeatherResponse = {
        temperature: response.data.current.temp_c,
        humidity: response.data.current.humidity,
        description: response.data.current.condition.text,
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

  private formEmailContent(
    weather: WeatherResponse,
    city: string,
    token: string,
  ) {
    return `<p>The current weather in <b>${city}</b> is ${weather.description}
            with a temperature of <b>${weather.temperature}°C</b> and a humidity of <b>${weather.humidity}%</b></p>
            <p>Click <a href="http://localhost:3000/api/unsubscribe/${token}">here</a> to unsubscribe</p>`;
  }
}
