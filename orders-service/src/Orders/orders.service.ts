import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { ResilienceService } from './resilience.service';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        private resilienceService: ResilienceService,
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
        } catch (error) {
            console.error(`[Orders Service] Circuit Breaker blocked/failed emit: ${error.message}`);
            // هنا يظل الطلب محفوظاً في قاعدة البيانات بحالة PENDING
            // يمكن لاحقاً إضافة آلية لإعادة المحاولة (Retry Mechanism)
        }

        return savedOrder;
    }

    async confirmOrder(orderId: number) {
        console.log(`[Orders Service] Confirming order ${orderId}`);
        await this.ordersRepository.update(orderId, { status: 'CONFIRMED' });
    }

    async rejectOrder(orderId: number) {
        console.log(`[Orders Service] Rejecting order ${orderId}`);
        await this.ordersRepository.update(orderId, { status: 'REJECTED' });
    }

    async findAll(): Promise<Order[]> {
        return this.ordersRepository.find();
    }
}
