import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const defaultRmqUrl = Buffer.from('YW1xcDovL3JhYmJpdG1xOjU2NzI=', 'base64').toString('utf8');
  const queueName = Buffer.from('Y2FydF9zZXJ2aWNlX3F1ZXVl', 'base64').toString('utf8');

  // Connect RabbitMQ microservice listener
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || defaultRmqUrl],
      queue: queueName,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();

  const port = process.env.PORT ?? 3007;
  await app.listen(port);
  console.log(`[Cart Service] HTTP API is running on port: ${port}`);
  console.log(`[Cart Service] RabbitMQ Microservice connected to: ${process.env.RABBITMQ_URL || defaultRmqUrl}`);
}
bootstrap();
