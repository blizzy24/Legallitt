import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const port = Number(process.env.PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be supplied as an integer between 1 and 65535");
  }
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  const origins =
    process.env.CORS_ORIGINS?.split(",")
      .map((value) => value.trim())
      .filter(Boolean) ?? [];
  app.enableCors({
    origin: origins,
    allowedHeaders: ["Authorization", "Content-Type"],
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
  });
  await app.listen(port, "0.0.0.0");
}

void bootstrap();
