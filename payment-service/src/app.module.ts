import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PaymentTransaction } from './entities/transaction.entity';
import { PaymentService } from './payment.service';
import { InventoryReservedListener } from './messaging/inventory-reserved.listener';
import { PaymentController } from './payment.controller';

// فك تشفير البيانات الحساسة وقواعد البيانات والمنافذ
const decodeB64 = (val: string) => Buffer.from(val, 'base64').toString('utf8');

const defaultDbHost = decodeB64('cGF5bWVudC1kYg==');
const defaultDbPort = Number(decodeB64('NTQzMg=='));
const defaultDbUser = decodeB64('cG9zdGdyZXM=');
const defaultDbPass = decodeB64('emFmZXI0NTE5OTMyMDkz');
const defaultDbName = decodeB64('cGF5bWVudF9kYg==');

const defaultRmqUrl = decodeB64('YW1xcDovL3JhYmJpdG1xOjU2NzI=');
const ordersQueue = decodeB64('b3JkZXJzX3F1ZXVl');
const warehouseQueue = decodeB64('d2FyZWhvdXNlX3NlcnZpY2VfcXVldWU=');

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || defaultDbHost,
      port: Number(process.env.DATABASE_PORT) || defaultDbPort,
      username: process.env.DATABASE_USER || defaultDbUser,
      password: process.env.DATABASE_PASSWORD || defaultDbPass,
      database: process.env.DATABASE_NAME || defaultDbName,
      entities: [PaymentTransaction],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([PaymentTransaction]),
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
        name: 'WAREHOUSE_RMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || defaultRmqUrl],
          queue: warehouseQueue,
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
