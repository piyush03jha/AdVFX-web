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
    new FastifyAdapter({
      logger: process.env.NODE_ENV !== "test",
    }),
  );

  const maxUploadSizeMb = Number(process.env.MAX_UPLOAD_SIZE ?? 50);
  if (!Number.isFinite(maxUploadSizeMb) || maxUploadSizeMb <= 0 || maxUploadSizeMb > 1024) {
    throw new Error("MAX_UPLOAD_SIZE must be a positive value up to 1024 MB");
  }

  await app.register(multipart, {
    limits: {
      fileSize: maxUploadSizeMb * 1024 * 1024,
      files: 1,
    },
  });

  app.enableCors({
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",").map((value) => value.trim()).filter(Boolean)
      : process.env.NODE_ENV === "production"
        ? false
        : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app
    .getHttpAdapter()
    .getInstance()
    .addHook("onRequest", async (request, reply) => {
      const configuredLimit = Number(process.env.API_RATE_LIMIT_PER_MINUTE ?? 120);
      const limit = Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : 120;
      const now = Date.now();
      const windowStart = Number(request.headers["x-rate-limit-window-start"] ?? 0);
      const requestCount = Number(request.headers["x-rate-limit-count"] ?? 0);

      // This lightweight process-local limiter is intentionally scoped to the current
      // application instance. A distributed limiter should replace it when Redis is added.
      const key = request.ip;
      const state = app.getHttpAdapter().getInstance().__rateLimitState ?? new Map();
      app.getHttpAdapter().getInstance().__rateLimitState = state;
      const current = state.get(key);
      const next = !current || now - current.startedAt >= 60_000
        ? { startedAt: now, count: 1 }
        : { startedAt: current.startedAt, count: current.count + 1 };
      state.set(key, next);

      reply.header("X-RateLimit-Limit", limit);
      reply.header("X-RateLimit-Remaining", Math.max(0, limit - next.count));

      if (next.count > limit) {
        reply.code(429).header("Retry-After", "60").send({ message: "Too many requests" });
      }

      void windowStart;
      void requestCount;
    });

  /**
   * Prisma returns BigInt values as JavaScript bigint.
   * Fastify's JSON serializer cannot serialize bigint.
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

  await app.listen(Number(process.env.PORT ?? 3000), "0.0.0.0");
}

bootstrap();
