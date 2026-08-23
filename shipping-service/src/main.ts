import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

    // الاستماع لحوادث RabbitMQ (queue مخصص لخدمة الشحن)
    app.connectMicroservice({
        transport: Transport.RMQ,
        options: {
            urls: [RABBITMQ_URL],
            queue: 'shipping_service_queue',
            queueOptions: { durable: true },
        },
    });

    await app.startAllMicroservices();

    const port = 3006;
    await app.listen(port);
    console.log(`[Shipping Service] HTTP API is running on port: ${port}`);
    console.log(`[Shipping Service] RabbitMQ Microservice connected to: ${RABBITMQ_URL}`);
}
bootstrap();
