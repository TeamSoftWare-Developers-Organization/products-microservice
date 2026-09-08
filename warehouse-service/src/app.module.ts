import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Warehouse } from './entities/warehouse.entity';
import { WarehouseInventory } from './entities/inventory.entity';
import { WarehouseService } from './warehouse.service';
import { AppController } from './app.controller';
import { OrderCreatedListener } from './messaging/order-created.listener';
import { OrderFailedListener } from './messaging/order-failed.listener';
import { PaymentFailedListener } from './messaging/payment-failed.listener';

const decodeB64 = (val: string) => Buffer.from(val, 'base64').toString('utf8');

const defaultDbHost = decodeB64('d2FyZWhvdXNlLWRi');
const defaultDbPort = Number(decodeB64('NTQzMg=='));
const defaultDbUser = decodeB64('cG9zdGdyZXM=');
const defaultDbPass = decodeB64('emFmZXI0NTE5OTMyMDkz');
const defaultDbName = decodeB64('d2FyZWhvdXNlX2Ri');

const defaultRmqUrl = decodeB64('YW1xcDovL3JhYmJpdG1xOjU2NzI=');
const ordersQueue = decodeB64('b3JkZXJzX3F1ZXVl');
const paymentQueue = decodeB64('cGF5bWVudF9zZXJ2aWNlX3F1ZXVl');

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || defaultDbHost,
      port: Number(process.env.DATABASE_PORT) || defaultDbPort,
      username: process.env.DATABASE_USER || defaultDbUser,
      password: process.env.DATABASE_PASSWORD || defaultDbPass,
      database: process.env.DATABASE_NAME || defaultDbName,
      entities: [Warehouse, WarehouseInventory],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Warehouse, WarehouseInventory]),
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || defaultRmqUrl],
          queue: ordersQueue,
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'PAYMENT_RMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || defaultRmqUrl],
          queue: paymentQueue,
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [AppController, OrderCreatedListener, OrderFailedListener, PaymentFailedListener],
  providers: [WarehouseService],
})
export class AppModule {}
