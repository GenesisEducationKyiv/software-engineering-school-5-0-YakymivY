import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { MailModule } from './mail.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MailModule,
    {
      transport: Transport.TCP,
      options: { host: '0.0.0.0', port: 4000 },
    },
  );
  await app.listen();
}
void bootstrap();
