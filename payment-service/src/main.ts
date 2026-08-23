import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Connect RabbitMQ microservice listener
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
      queue: 'payment_service_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();

  const port = process.env.PORT ?? 3009;
  await app.listen(port);
  console.log(`[Payment Service] HTTP API is running on port: ${port}`);
  console.log(`[Payment Service] RabbitMQ Microservice connected to: ${process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'}`);
}
bootstrap();
