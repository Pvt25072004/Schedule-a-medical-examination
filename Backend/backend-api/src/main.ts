import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim())
    : undefined;
  app.enableCors({
    origin: allowedOrigins ?? true,
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 8080);
}
void bootstrap();
