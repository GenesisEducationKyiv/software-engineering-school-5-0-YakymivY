import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

import { AppController } from './app.controller';
import { MailController } from './controllers/mail.controller';
import { MailService } from './services/mail.service';
import { MailBuilderService } from './services/mail-builder.service';
import { MailEventController } from './controllers/mail-event.controller';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'test'
          ? 'apps/mail/.env.test'
          : 'apps/mail/.env',
    }),
    CommonModule,
    PrometheusModule.register(),
  ],
  controllers: [MailController, MailEventController, AppController],
  providers: [
    { provide: 'Mailer', useClass: MailService },
    { provide: 'MailBuilder', useClass: MailBuilderService },
  ],
})
export class MailModule {}
