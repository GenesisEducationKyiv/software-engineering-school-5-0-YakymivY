import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WeatherModule } from '../weather/weather.module';
import { WeatherService } from '../weather/services/weather.service';

import { SubscriptionService } from './services/subscription.service';
import { SubscriptionController } from './controllers/subscription.controller';
import { Subscription } from './entities/subscription.entity';
import { MailService } from './services/mail.service';
import { ScheduledUpdatesService } from './services/scheduled-updates.service';
import { MailBuilderService } from './services/mail-builder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription]), WeatherModule],
  providers: [
    SubscriptionService,
    ScheduledUpdatesService,
    {
      provide: 'WeatherApi',
      useClass: WeatherService,
    },
    {
      provide: 'Mailer',
      useClass: MailService,
    },
<<<<<<< HEAD
    MailBuilderService,
=======
>>>>>>> dc12e32 (dependency inversion for mail and weather services)
  ],
  controllers: [SubscriptionController],
  exports: [SubscriptionService, 'Mailer'],
})
export class SubscriptionModule {}
