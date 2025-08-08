import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

import { MailController } from './controllers/mail.controller';
import { MailService } from './services/mail.service';
import { MailBuilderService } from './services/mail-builder.service';
import { MailEventController } from './controllers/mail-event.controller';
import { CommonModule } from './common/common.module';
import { MetricsController } from './controllers/metrics.controller';

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
  controllers: [MailController, MailEventController, MetricsController],
  providers: [
    { provide: 'Mailer', useClass: MailService },
    { provide: 'MailBuilder', useClass: MailBuilderService },
  ],
})
export class MailModule {}
