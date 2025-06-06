import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { HttpExceptionFilter } from 'libs/http-exception.filter';
import { LoggingInterceptor } from 'libs/interceptor/logging-interceptor';

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create(AppModule, {
    logger: isProd
      ? ['warn', 'verbose', 'error']
      : ['debug', 'error', 'warn', 'verbose', 'fatal'],
  });

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.use('/uploads', express.static('./uploads'));
  app.enableCors({
    origin: [
      'https://cvcons.com',
      'http://cvcons.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:4000',
      'http://localhost:4001',
    ],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
  Logger.verbose(`App running in ${process.env.NODE_ENV} mode`);
}
bootstrap();
