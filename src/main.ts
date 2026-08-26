import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import multipart from "@fastify/multipart";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";


async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  await app.register(multipart, {
    limits: {
      fileSize: 500 * 1024 * 1024,
      files: 1,
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({ 
      whitelist: true, 
      forbidNonWhitelisted: true,
      transform: true 
    })
  );
  
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
