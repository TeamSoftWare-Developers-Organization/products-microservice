import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingModule } from './Shipping/shipping.module.js';
import { Shipment } from './Shipping/shipment.entity.js';
import { DeliveryTicket } from './Shipping/entities/delivery-ticket.entity.js';
import { CashCollection } from './Shipping/entities/cash-collection.entity.js';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DATABASE_HOST') || 'shipping-db',
                port: 5432,
                username: configService.get<string>('DATABASE_USER') || 'postgres',
                password: configService.get<string>('DATABASE_PASSWORD') || 'zafer4519932093',
                database: configService.get<string>('DATABASE_NAME') || 'shipping_db',
                entities: [Shipment, DeliveryTicket, CashCollection],
                synchronize: true, // يُنشئ الجدول تلقائياً
                logging: false,
            }),
            inject: [ConfigService],
        }),
        ShippingModule,
    ],
})
export class AppModule { }
