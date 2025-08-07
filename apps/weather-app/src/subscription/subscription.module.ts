import { join } from 'path';

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import {
  ClientsModule,
  Transport,
  ClientProvider,
} from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { WeatherModule } from '../weather/weather.module';

import { SubscriptionService } from './application/services/subscription.service';
import { SubscriptionController } from './presentation/controllers/subscription.controller';
import { Subscription } from './domain/entities/subscription.entity';
import { ScheduledUpdatesService } from './application/services/scheduled-updates.service';
import { MailClientService } from './infrastructure/services/mail-client.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Subscription]),
    forwardRef(() => WeatherModule),
    HttpModule,
    ClientsModule.registerAsync([
      {
        name: 'MAIL_PACKAGE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (
          config: ConfigService,
        ): ClientProvider | Promise<ClientProvider> => ({
          transport: Transport.GRPC,
          options: {
            package: 'mail',
            protoPath: join(__dirname, config.get<string>('PROTO_PATH')),
            url: `${config.get<string>('MS_HOST')}:${config.get<string>('MS_PORT')}`,
          },
        }),
      },
    ]),
  ],
  providers: [SubscriptionService, ScheduledUpdatesService, MailClientService],
  controllers: [SubscriptionController],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
