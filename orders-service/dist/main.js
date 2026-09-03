"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./tracing");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const microservices_1 = require("@nestjs/microservices");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const RABBITMQ_URL = configService.get('RABBITMQ_URL') || 'amqp://rabbitmq:5672';
    app.connectMicroservice({
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: [RABBITMQ_URL],
            queue: 'orders_queue',
            queueOptions: {
                durable: true,
            },
        },
    });
    await app.startAllMicroservices();
    const port = 3003;
    await app.listen(port);
    console.log(`[Orders Service] HTTP API is running on port: ${port} (External: 3001)`);
    console.log(`[Orders Service] RabbitMQ connectivity initialized.`);
}
bootstrap();
//# sourceMappingURL=main.js.map