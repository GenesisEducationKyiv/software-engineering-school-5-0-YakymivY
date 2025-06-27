import { INestApplication, ValidationPipe } from '@nestjs/common';

import { HttpExceptionsFilter } from '../../src/common/filters/http-exception.filter';

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
