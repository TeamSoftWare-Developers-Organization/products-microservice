import './tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const RABBITMQ_URL = configService.get<string>('RABBITMQ_URL') || 'amqp://rabbitmq:5672';

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [RABBITMQ_URL],
      queue: 'orders_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  const port = 3000;
  await app.listen(port);
  console.log(`[Orders Service] HTTP API is running on port: ${port} (External: 3001)`);
  console.log(`[Orders Service] RabbitMQ connectivity initialized.`);
}
bootstrap();
