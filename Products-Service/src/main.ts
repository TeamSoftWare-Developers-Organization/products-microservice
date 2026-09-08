// src/main.ts

import './tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  // إنشاء تطبيق هجين (HTTP API و RabbitMQ Microservice)
  const app = await NestFactory.create(AppModule);


  // جلب خدمة الإعدادات مع تشفير الرابط الافتراضي
  const configService = app.get(ConfigService);
  const defaultRmqUrl = Buffer.from('YW1xcDovL3JhYmJpdG1xOjU2NzI=', 'base64').toString('utf8');
  const RABBITMQ_URL = configService.get<string>('RABBITMQ_URL') || defaultRmqUrl;

  // 1. تهيئة خدمة RabbitMQ (الاتصال بالوسيط)
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [RABBITMQ_URL],
      queue: 'products_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  // 2. بدء المستمعين (RabbitMQ) وخادم HTTP API
  await app.startAllMicroservices();

  // تشغيل خادم HTTP على المنفذ 3002 (ليطابق docker-compose.yml)
  const port = 3002;
  await app.listen(port);
  console.log(`[Products Service] HTTP API is running on port: ${port}`);
  console.log(`[Products Service] RabbitMQ Microservice is connected to: ${RABBITMQ_URL}`);
}
bootstrap();