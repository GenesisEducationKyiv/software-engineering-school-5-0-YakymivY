import { join } from 'path';

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';

import { winstonLoggerOptions } from '../../../logger.config';

import { MailModule } from './mail.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(MailModule, {
    logger: WinstonModule.createLogger(winstonLoggerOptions),
  });
  const configService = app.get(ConfigService);

  const rabbitHost = configService.get<string>('RABBITMQ_HOST');
  const rabbitPort = configService.get<number>('RABBITMQ_PORT');
  const rabbitUser = configService.get<string>('RABBITMQ_USER');
  const rabbitPass = configService.get<string>('RABBITMQ_PASS');

  // gRPC microservice transport
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'mail',
      protoPath: join(__dirname, '../proto/mail.proto'),
      url: '0.0.0.0:4000',
    },
  });

  // RabbitMQ microservice transport
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        'amqp://' +
          rabbitUser +
          ':' +
          rabbitPass +
          '@' +
          rabbitHost +
          ':' +
          rabbitPort,
      ],
      queue: 'email_queue',
      queueOptions: { durable: true },
    },
  });
  await app.startAllMicroservices();

  await app.listen(process.env.PORT ?? 4001);
  console.log('HTTP server listening on port 4001');
}
void bootstrap();
