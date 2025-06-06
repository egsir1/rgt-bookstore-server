import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create(AppModule, {
    logger: isProd
      ? ['warn', 'verbose', 'error']
      : ['debug', 'error', 'warn', 'verbose', 'fatal', 'log'],
  });
  await app.listen(process.env.PORT ?? 3000);
  Logger.verbose(`App running in ${process.env.NODE_ENV} mode`);
}
bootstrap();
