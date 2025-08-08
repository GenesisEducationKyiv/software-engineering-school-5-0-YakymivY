import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MailController } from './controllers/mail.controller';
import { MailService } from './services/mail.service';
import { MailBuilderService } from './services/mail-builder.service';
import { MailEventController } from './controllers/mail-event.controller';

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
  controllers: [MailController, MailEventController],
  providers: [
    { provide: 'Mailer', useClass: MailService },
    { provide: 'MailBuilder', useClass: MailBuilderService },
  ],
})
export class MailModule {}
