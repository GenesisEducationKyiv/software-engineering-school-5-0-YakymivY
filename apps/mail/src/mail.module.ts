import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MailController } from './controllers/mail.controller';
import { MailService } from './services/mail.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'test'
          ? 'apps/mail/.env.test'
          : 'apps/mail/.env',
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
