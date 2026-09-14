import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ResilienceService } from './resilience.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CreateOrderHandler } from './commands/handlers/create-order.handler';
import { ConfirmOrderHandler } from './commands/handlers/confirm-order.handler';
import { RejectOrderHandler } from './commands/handlers/reject-order.handler';
import { FailOrderHandler } from './commands/handlers/fail-order.handler';
import { GetOrdersHandler } from './queries/handlers/get-orders.handler';

export const CommandHandlers = [CreateOrderHandler, ConfirmOrderHandler, RejectOrderHandler, FailOrderHandler];
export const QueryHandlers = [GetOrdersHandler];

@Module({
    imports: [
        TypeOrmModule.forFeature([Order]),
        ClientsModule.registerAsync([
            {
                name: 'PRODUCT_SERVICE',
                imports: [ConfigModule],
                useFactory: (config: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [config.get<string>('RABBITMQ_URL') || 'amqp://rabbitmq:5672'],
                        queue: 'warehouse_service_queue',
                        queueOptions: {
                            durable: true,
                        },
                    },
                }),
                inject: [ConfigService],
            },
            {
                name: 'NOTIFICATION_SERVICE',
                imports: [ConfigModule],
                useFactory: (config: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [config.get<string>('RABBITMQ_URL') || 'amqp://rabbitmq:5672'],
                        queue: 'notifications_queue',
                        queueOptions: {
                            durable: true,
                        },
                    },
                }),
                inject: [ConfigService],
            },
            {
                name: 'SHIPPING_SERVICE',
                imports: [ConfigModule],
                useFactory: (config: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [config.get<string>('RABBITMQ_URL') || 'amqp://rabbitmq:5672'],
                        queue: 'shipping_service_queue',
                        queueOptions: {
                            durable: true,
                        },
                    },
                }),
                inject: [ConfigService],
            },
            {
                name: 'CART_SERVICE',
                imports: [ConfigModule],
                useFactory: (config: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [config.get<string>('RABBITMQ_URL') || 'amqp://rabbitmq:5672'],
                        queue: 'cart_service_queue',
                        queueOptions: {
                            durable: true,
                        },
                    },
                }),
                inject: [ConfigService],
            },
        ]),
        CqrsModule,
    ],
    controllers: [OrdersController],
    providers: [OrdersService, ResilienceService, ...CommandHandlers, ...QueryHandlers],
})
export class OrdersModule { }
