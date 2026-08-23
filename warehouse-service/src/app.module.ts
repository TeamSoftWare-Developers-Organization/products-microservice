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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'warehouse-db',
      port: 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'zafer4519932093',
      database: process.env.DATABASE_NAME || 'warehouse_db',
      entities: [Warehouse, WarehouseInventory],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Warehouse, WarehouseInventory]),
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
          queue: 'orders_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'PAYMENT_RMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
          queue: 'payment_service_queue',
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
