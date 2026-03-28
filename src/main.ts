import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ormConfig } from '../ormConfig';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await ormConfig.initialize();
  await ormConfig.runMigrations();

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
