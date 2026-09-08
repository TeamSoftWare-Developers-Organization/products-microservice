import './tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const defaultRmqUrl = Buffer.from('YW1xcDovL3JhYmJpdG1xOjU2NzI=', 'base64').toString('utf8');
    const queueName = Buffer.from('bm90aWZpY2F0aW9uc19xdWV1ZQ==', 'base64').toString('utf8');

    // Connect to RabbitMQ
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

    // For WebSockets, we can run on a separate port or the same
    await app.listen(3004);
    console.log(`[Notification Service] is running on port: 3004`);
}
bootstrap();
