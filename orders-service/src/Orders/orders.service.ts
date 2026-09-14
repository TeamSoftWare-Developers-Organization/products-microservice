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


    async createOrder(input: {
        productId: number;
        quantity: number;
        userId?: string;
        warehouseId?: number;
        gateway?: string;
        customerData?: { name?: string; phone?: string; city?: string; address?: string };
        unitPrice?: number;
    }): Promise<Order> {
        const quantity = Math.max(1, Number(input.quantity));
        const unitPrice = Math.max(0, Number(input.unitPrice || 0));
        const totalAmount = Number((unitPrice * quantity).toFixed(3));
        const order = this.ordersRepository.create({
            productId: Number(input.productId),
            quantity,
            unitPrice,
            totalAmount,
            warehouseId: Number(input.warehouseId || 1),
            gateway: input.gateway || 'CASH',
            status: 'PENDING',
            userId: input.userId,
            customerName: input.customerData?.name,
            customerPhone: input.customerData?.phone,
            customerCity: input.customerData?.city,
            customerAddress: input.customerData?.address,
        });
        const savedOrder = await this.ordersRepository.save(order);

        const event = {
            orderId: savedOrder.id,
            productId: savedOrder.productId,
            quantity: savedOrder.quantity,
            userId: savedOrder.userId,
            warehouseId: savedOrder.warehouseId,
            gateway: savedOrder.gateway,
            totalAmount: Number(savedOrder.totalAmount),
            customerData: {
                name: savedOrder.customerName,
                phone: savedOrder.customerPhone,
                city: savedOrder.customerCity,
                address: savedOrder.customerAddress,
            },
        };

        try {
            await this.resilienceService.fire('order_created', event);
            this.notificationClient.emit('order_created', event);
        } catch (error: any) {
            console.error(`[Orders Service] Failed to publish order_created: ${error?.message || error}`);
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
        this.shippingClient.emit('order_confirmed_for_shipping', {
            orderId,
            totalAmount: Number(order?.totalAmount || 0),
            customerData: {
                name: order?.customerName, phone: order?.customerPhone, city: order?.customerCity, address: order?.customerAddress,
            },
        });
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
        } catch (error: any) {
            console.error(`[Orders Service] Failed to emit order.failed compensating event: ${error?.message || error}`);
        }
    }

    async findAll(): Promise<Order[]> {
        return this.ordersRepository.find();
    }
}
