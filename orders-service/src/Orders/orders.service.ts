import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { ResilienceService } from './resilience.service';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        private resilienceService: ResilienceService,
        @Inject('NOTIFICATION_SERVICE') private notificationClient: ClientProxy,
    ) { }

    async createOrder(productId: number, quantity: number): Promise<Order> {
        const order = this.ordersRepository.create({ productId, quantity, status: 'PENDING' });
        const savedOrder = await this.ordersRepository.save(order);

        console.log(`[Orders Service] Attempting to emit order_created via Breaker for order ${savedOrder.id}`);

        try {
            await this.resilienceService.fire('order_created', {
                orderId: savedOrder.id,
                productId,
                quantity
            });

            // Also notify notification service directly if we want
            this.notificationClient.emit('order_created', {
                orderId: savedOrder.id,
                productId,
                quantity
            });
        } catch (error) {
            console.error(`[Orders Service] Circuit Breaker blocked/failed emit: ${error.message}`);
        }

        return savedOrder;
    }

    async confirmOrder(orderId: number) {
        console.log(`[Orders Service] Confirming order ${orderId}`);
        await this.ordersRepository.update(orderId, { status: 'CONFIRMED' });
        this.notificationClient.emit('order_confirmed', { orderId });
    }

    async rejectOrder(orderId: number) {
        console.log(`[Orders Service] Rejecting order ${orderId}`);
        await this.ordersRepository.update(orderId, { status: 'REJECTED' });
        this.notificationClient.emit('order_rejected', { orderId });
    }

    async findAll(): Promise<Order[]> {
        return this.ordersRepository.find();
    }
}
