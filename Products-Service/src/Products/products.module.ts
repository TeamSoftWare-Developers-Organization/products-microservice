import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CreateProductHandler } from './commands/handlers/create-product.handler';
import { UpdateStockHandler } from './commands/handlers/update-stock.handler';
import { UpdateProductHandler } from './commands/handlers/update-product.handler';
import { RestoreStockHandler } from './commands/handlers/restore-stock.handler';
import { GetProductsHandler } from './queries/handlers/get-products.handler';
import { GetProductByIdHandler } from './queries/handlers/get-product-by-id.handler';
import { MinioService } from './minio.service';
import { AuthModule } from '../auth/auth.module';

export const CommandHandlers = [CreateProductHandler, UpdateStockHandler, UpdateProductHandler, RestoreStockHandler];
export const QueryHandlers = [GetProductsHandler, GetProductByIdHandler];

const defaultRmqUrl = Buffer.from('YW1xcDovL3JhYmJpdG1xOjU2NzI=', 'base64').toString('utf8');

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    ClientsModule.registerAsync([
      {
        name: 'ORDER_SERVICE',
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL') || defaultRmqUrl],
            queue: 'orders_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    CqrsModule,
    AuthModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, MinioService, ...CommandHandlers, ...QueryHandlers],
  exports: [ProductsService, MinioService]
})
export class ProductsModule { }