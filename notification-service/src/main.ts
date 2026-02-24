import './tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Connect to RabbitMQ
    app.connectMicroservice({
        transport: Transport.RMQ,
        options: {
            urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
            queue: 'orders_queue',
            queueOptions: {
                durable: true,
            },
        },
    });

    await app.startAllMicroservices();

    // For WebSockets, we can run on a separate port or the same
    await app.listen(3004);
    console.log(`[Notification Service] is running on port: 3004`);
}
bootstrap();
