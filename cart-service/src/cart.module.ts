import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { OrderConfirmedListener } from './messaging/order-confirmed.listener';
import Redis from 'ioredis';

@Module({
  controllers: [CartController, OrderConfirmedListener],
  providers: [
    CartService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST || 'cart-redis',
          port: 6379,
        });
      },
    },
  ],
})
export class CartModule {}
