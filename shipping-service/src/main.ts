import './tracer'; // يجب أن يكون في أول سطر لضمان تتبع كافة الطلبات عبر Zipkin و OpenTelemetry
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const defaultRmqUrl = Buffer.from('YW1xcDovL3JhYmJpdG1xOjU2NzI=', 'base64').toString('utf8');
    const queueName = Buffer.from('c2hpcHBpbmdfc2VydmljZV9xdWV1ZQ==', 'base64').toString('utf8');
    const RABBITMQ_URL = process.env.RABBITMQ_URL || defaultRmqUrl;

    // الاستماع لحوادث RabbitMQ (queue مخصص لخدمة الشحن)
    app.connectMicroservice({
        transport: Transport.RMQ,
        options: {
            urls: [RABBITMQ_URL],
            queue: queueName,
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
