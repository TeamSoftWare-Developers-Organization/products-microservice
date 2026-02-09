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
import { GetProductsHandler } from './queries/handlers/get-products.handler';
import { GetProductByIdHandler } from './queries/handlers/get-product-by-id.handler';

export const CommandHandlers = [CreateProductHandler, UpdateStockHandler];
export const QueryHandlers = [GetProductsHandler, GetProductByIdHandler];

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
            urls: [config.get<string>('RABBITMQ_URL') || 'amqp://rabbitmq:5672'],
            queue: 'orders_queue',
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    CqrsModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ...CommandHandlers, ...QueryHandlers],
  exports: [ProductsService]
})
export class ProductsModule { }