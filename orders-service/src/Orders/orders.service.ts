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
        @Inject('SHIPPING_SERVICE') private shippingClient: ClientProxy,
        @Inject('CART_SERVICE') private cartClient: ClientProxy,
    ) { }


    async createOrder(productId: number, quantity: number, userId?: string): Promise<Order> {
        const order = this.ordersRepository.create({ productId, quantity, status: 'PENDING', userId });
        const savedOrder = await this.ordersRepository.save(order);

        console.log(`[Orders Service] Attempting to emit order_created via Breaker for order ${savedOrder.id}`);

        try {
            await this.resilienceService.fire('order_created', {
                orderId: savedOrder.id,
                productId,
                quantity,
                userId
            });

            // Also notify notification service directly if we want
            this.notificationClient.emit('order_created', {
                orderId: savedOrder.id,
                productId,
                quantity,
                userId
            });
        } catch (error) {
            console.error(`[Orders Service] Circuit Breaker blocked/failed emit: ${error.message}`);
        }

        return savedOrder;
    }

    async confirmOrder(orderId: number) {
        console.log(`[Orders Service] Confirming order ${orderId}`);
        const order = await this.ordersRepository.findOne({ where: { id: orderId } });
        await this.ordersRepository.update(orderId, { status: 'CONFIRMED' });
        
        // Pass userId if available in order_confirmed event
        this.notificationClient.emit('order_confirmed', { orderId, userId: order?.userId });
        this.cartClient.emit('order_confirmed', { orderId, userId: order?.userId });

        // إخطار خدمة الشحن لإنشاء بوليصة الشحن تلقائياً
        this.shippingClient.emit('order_confirmed_for_shipping', { orderId });
        console.log(`[Orders Service] Emitted order_confirmed_for_shipping for order ${orderId}`);
    }

    async rejectOrder(orderId: number) {
        console.log(`[Orders Service] Rejecting order ${orderId}`);
        await this.ordersRepository.update(orderId, { status: 'REJECTED' });
        this.notificationClient.emit('order_rejected', { orderId });
    }

    async findOne(id: number): Promise<Order | null> {
        return this.ordersRepository.findOne({ where: { id } });
    }

    async failOrder(orderId: number) {
        console.log(`[Orders Service] Failing order ${orderId}`);
        const order = await this.ordersRepository.findOne({ where: { id: orderId } });
        if (!order) {
            console.error(`Order with ID ${orderId} not found for failing`);
            return;
        }

        order.status = 'FAILED';
        await this.ordersRepository.save(order);

        try {
            await this.resilienceService.fire('order.failed', {
                productId: order.productId,
                quantity: order.quantity
            });
            this.notificationClient.emit('order_failed', { orderId });
        } catch (error) {
            console.error(`[Orders Service] Failed to emit order.failed compensating event: ${error.message}`);
        }
    }

    async findAll(): Promise<Order[]> {
        return this.ordersRepository.find();
    }
}
