import "dotenv/config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import multipart from "@fastify/multipart";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  await app.register(multipart, {
    limits: {
      fileSize:
        Number(process.env.MAX_UPLOAD_SIZE ?? 2048) * 1024 * 1024,
      files: 1,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /**
   * Prisma returns BigInt values as JavaScript bigint.
   *
   * Fastify's JSON serializer cannot serialize bigint.
   * Convert bigint values to strings before JSON serialization.
   *
   * We use strings instead of Number() because file sizes,
   * prices, counters, etc. may eventually exceed JS safe integer limits.
   */
  app
    .getHttpAdapter()
    .getInstance()
    .addHook("preSerialization", async (_request, _reply, payload) => {
      return JSON.parse(
        JSON.stringify(payload, (_key, value) =>
          typeof value === "bigint" ? value.toString() : value,
        ),
      );
    });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();