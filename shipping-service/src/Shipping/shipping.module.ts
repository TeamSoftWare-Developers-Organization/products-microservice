import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Shipment } from './shipment.entity.js';
import { DeliveryTicket } from './entities/delivery-ticket.entity.js';
import { CashCollection } from './entities/cash-collection.entity.js';
import { ShippingService } from './shipping.service.js';
import { ShippingController } from './shipping.controller.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([Shipment, DeliveryTicket, CashCollection]),
        ClientsModule.registerAsync([
            {
                name: 'NOTIFICATION_SERVICE',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://rabbitmq:5672'],
                        queue: 'notifications_queue',
                        queueOptions: { durable: true },
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [ShippingController],
    providers: [ShippingService],
})
export class ShippingModule { }
