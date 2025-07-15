import { join } from 'path';

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { MailModule } from './mail.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MailModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'mail',
        protoPath: join(__dirname, '../proto/mail.proto'),
        url: '0.0.0.0:4000',
      },
    },
  );
  await app.listen();
}
void bootstrap();
