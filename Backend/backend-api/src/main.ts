import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Tăng giới hạn kích thước body để nhận được ảnh base64 (avatar, CCCD)
  app.use(
    json({
      limit: '5mb', // mặc định ~100kb, nâng lên 5MB
    }),
  );
  app.use(
    urlencoded({
      extended: true,
      limit: '5mb',
    }),
  );

  // Prefix global /api
  app.setGlobalPrefix('api');

  // Enable CORS
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim())
    : undefined;

  app.enableCors({
    origin: allowedOrigins ?? true,
    credentials: true,
  });

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // start swagger config
  const config = new DocumentBuilder()
    .setTitle('Clinic Appointment API')
    .setDescription('Tài liệu API quản lý lịch khám bệnh')
    .setVersion('1.0')
    .addTag('Appointments') // Thẻ để gom nhóm các API
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // config swagger with url /api/swagger
  SwaggerModule.setup('swagger', app, document, {
    useGlobalPrefix: true,
  });

  const port = process.env.PORT ?? 8080;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
void bootstrap();
