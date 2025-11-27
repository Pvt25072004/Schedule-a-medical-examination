import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // <--- 1. Thêm import này

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefix toàn cục là /api
  app.setGlobalPrefix('api');

  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim())
    : undefined;

  app.enableCors({
    origin: allowedOrigins ?? true,
    credentials: true,
  });

  // --- 2. BẮT ĐẦU CẤU HÌNH SWAGGER ---
  const config = new DocumentBuilder()
    .setTitle('Clinic Appointment API')
    .setDescription('Tài liệu API quản lý lịch khám bệnh')
    .setVersion('1.0')
    .addTag('Appointments') // Thẻ để gom nhóm các API
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Cấu hình đường dẫn hiển thị Swagger
  // 'docs' kết hợp với useGlobalPrefix: true => đường dẫn sẽ là /api/docs
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
  });
  // ------------------------------------

  await app.listen(process.env.PORT ?? 8080);
}
void bootstrap();
