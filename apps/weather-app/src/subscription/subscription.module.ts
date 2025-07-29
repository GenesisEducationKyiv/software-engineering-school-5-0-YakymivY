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
import { MailEventService } from './infrastructure/services/mail-event.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Subscription]),
    forwardRef(() => WeatherModule),
    HttpModule,
    ClientsModule.registerAsync([
      // gRPC client
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
      // RabbitMQ event client
      {
        name: 'MAIL_EVENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (
          config: ConfigService,
        ): ClientProvider | Promise<ClientProvider> => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              `amqp://guest:guest@${config.get<string>('RABBITMQ_HOST')}:${config.get<string>('RABBITMQ_PORT')}`,
            ],
            queue: 'email_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  providers: [
    {
      provide: 'SubscriptionService',
      useClass: SubscriptionService,
    },
    ScheduledUpdatesService,
    MailClientService,
    MailEventService,
    {
      provide: 'MailService',
      useClass: MailEventService,
    },
  ],
  controllers: [SubscriptionController],
  exports: ['SubscriptionService'],
})
export class SubscriptionModule {}
