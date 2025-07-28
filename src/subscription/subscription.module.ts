import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { WeatherModule } from '../weather/weather.module';
import { WeatherService } from '../weather/application/services/weather.service';

import { SubscriptionService } from './application/services/subscription.service';
import { SubscriptionController } from './presentation/controllers/subscription.controller';
import { Subscription } from './domain/entities/subscription.entity';
import { MailService } from './infrastructure/services/mail.service';
import { ScheduledUpdatesService } from './application/services/scheduled-updates.service';
import { MailBuilderService } from './application/services/mail-builder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription]),
    forwardRef(() => WeatherModule),
    HttpModule,
  ],
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
    MailBuilderService,
  ],
  controllers: [SubscriptionController],
  exports: [SubscriptionService, 'Mailer'],
})
export class SubscriptionModule {}
