import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ormConfig } from '../ormConfig';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await ormConfig.initialize();

  // Only run migrations in production
  if (process.env.ENVIRONMENT !== 'development') {
    await ormConfig.runMigrations();
  }

  const config = new DocumentBuilder()
    .setTitle('Chejov API')
    .setDescription('API para la gestión de vuelos, aviones y pasajeros')
    .setVersion('1.0')
    .addTag('flights') // Puedes organizar por etiquetas
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // 'docs' será la URL

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
