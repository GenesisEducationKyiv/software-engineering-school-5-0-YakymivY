import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { WinstonModule } from 'nest-winston';

import { HttpExceptionsFilter } from '@app/common';

import { winstonLoggerOptions } from '../../../configs/logger.config';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonLoggerOptions),
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionsFilter());
  app.use(express.urlencoded({ extended: true }));
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
