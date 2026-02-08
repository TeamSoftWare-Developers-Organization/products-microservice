import { Controller, Post, Body, Get } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ResilienceService } from './resilience.service';

@Controller('api/orders')
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
        private readonly resilienceService: ResilienceService
    ) { }

    @Post()
    async create(@Body() data: { productId: number; quantity: number }) {
        // تغليف استدعاء الخدمة داخل قاطع الدائرة لزيادة المرونة
        return this.resilienceService.fireAction(
            () => this.ordersService.createOrder(data.productId, data.quantity)
        );
    }

    @Get()
    async findAll() {
        return this.ordersService.findAll();
    }

    @EventPattern('order_confirmed')
    async handleOrderConfirmed(@Payload() data: { orderId: number }) {
        console.log('Order confirmed message received:', data);
        await this.ordersService.confirmOrder(data.orderId);
    }

    @EventPattern('order_rejected')
    async handleOrderRejected(@Payload() data: { orderId: number }) {
        console.log('Order rejected message received:', data);
        await this.ordersService.rejectOrder(data.orderId);
    }
}
