// src/main.ts

import './tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  // إنشاء تطبيق هجين (HTTP API و RabbitMQ Microservice)
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // جلب خدمة الإعدادات
  const configService = app.get(ConfigService);
  const RABBITMQ_URL = configService.get<string>('RABBITMQ_URL') || 'amqp://rabbitmq:5672';

  // 1. تهيئة خدمة RabbitMQ (الاتصال بالوسيط)
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [RABBITMQ_URL],
      queue: 'products_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  // 2. بدء المستمعين (RabbitMQ) وخادم HTTP API
  await app.startAllMicroservices();

  // تشغيل خادم HTTP على المنفذ 3000 (ليطابق docker-compose.yml)
  const port = 3000;
  await app.listen(port);
  console.log(`[Products Service] HTTP API is running on port: ${port}`);
  console.log(`[Products Service] RabbitMQ Microservice is connected to: ${RABBITMQ_URL}`);
}
bootstrap();