import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { WeatherModule } from '../weather/weather.module';
import { WeatherService } from '../weather/services/weather.service';

import { SubscriptionService } from './services/subscription.service';
import { SubscriptionController } from './controllers/subscription.controller';
import { Subscription } from './entities/subscription.entity';
import { MailService } from './services/mail.service';
import { ScheduledUpdatesService } from './services/scheduled-updates.service';
import { MailBuilderService } from './services/mail-builder.service';

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
