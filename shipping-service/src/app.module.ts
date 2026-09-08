import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingModule } from './Shipping/shipping.module.js';
import { Shipment } from './Shipping/shipment.entity.js';
import { DeliveryTicket } from './Shipping/entities/delivery-ticket.entity.js';
import { CashCollection } from './Shipping/entities/cash-collection.entity.js';

// فك تشفير البيانات الحساسة وقواعد البيانات والمنافذ
const decodeB64 = (val: string) => Buffer.from(val, 'base64').toString('utf8');

const defaultProdHost = decodeB64('c2hpcHBpbmctZGI=');
const defaultLocalHost = decodeB64('bG9jYWxob3N0');
const defaultProdPort = Number(decodeB64('NTQzMg=='));
const defaultLocalPort = Number(decodeB64('NTQzNg=='));
const defaultDbUser = decodeB64('cG9zdGdyZXM=');
const defaultDbPass = decodeB64('emFmZXI0NTE5OTMyMDkz');
const defaultDbName = decodeB64('c2hpcHBpbmdfZGI=');

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DATABASE_HOST') || (process.env.NODE_ENV === 'production' ? defaultProdHost : defaultLocalHost),
                port: Number(configService.get<number>('DATABASE_PORT')) || (process.env.NODE_ENV === 'production' ? defaultProdPort : defaultLocalPort),
                username: configService.get<string>('DATABASE_USER') || defaultDbUser,
                password: configService.get<string>('DATABASE_PASSWORD') || defaultDbPass,
                database: configService.get<string>('DATABASE_NAME') || defaultDbName,
                entities: [Shipment, DeliveryTicket, CashCollection],
                synchronize: true, // يُنشئ الجدول تلقائياً
                logging: false,
                extra: {
                    connectionTimeoutMillis: 4000,
                    max: 20,
                },
                retryAttempts: 3,
                retryDelay: 1500,
            }),
            inject: [ConfigService],
        }),
        ShippingModule,
    ],
})
export class AppModule { }
