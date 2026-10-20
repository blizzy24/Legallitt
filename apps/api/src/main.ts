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
  await app.listen(port, "0.0.0.0");
}

void bootstrap();
