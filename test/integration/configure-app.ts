import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { HttpExceptionsFilter } from '@app/common';

export async function configureApp(app: INestApplication): Promise<void> {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionsFilter());
  await app.init();
}

export async function resetDatabase(dataSource: DataSource): Promise<void> {
  await dataSource.query(`DROP SCHEMA IF EXISTS public CASCADE`);
  await dataSource.query(`CREATE SCHEMA public`);
  await dataSource.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  await dataSource.synchronize();
}
