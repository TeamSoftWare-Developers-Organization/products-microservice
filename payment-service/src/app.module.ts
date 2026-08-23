import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PaymentTransaction } from './entities/transaction.entity';
import { PaymentService } from './payment.service';
import { InventoryReservedListener } from './messaging/inventory-reserved.listener';
import { PaymentController } from './payment.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'payment-db',
      port: 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'zafer4519932093',
      database: process.env.DATABASE_NAME || 'payment_db',
      entities: [PaymentTransaction],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([PaymentTransaction]),
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
        name: 'WAREHOUSE_RMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
          queue: 'warehouse_service_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [InventoryReservedListener, PaymentController],
  providers: [PaymentService],
})
export class AppModule {}
