import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { appDataSource } from '../ormConfig';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await appDataSource.initialize();
  await appDataSource.runMigrations();

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
