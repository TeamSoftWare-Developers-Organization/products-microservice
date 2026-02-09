import { Controller, Post, Body, Get } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateOrderCommand } from './commands/impl/create-order.command';
import { GetOrdersQuery } from './queries/impl/get-orders.query';
import { ConfirmOrderCommand } from './commands/impl/confirm-order.command';
import { RejectOrderCommand } from './commands/impl/reject-order.command';
import { ResilienceService } from './resilience.service';

@Controller('api/orders')
export class OrdersController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly resilienceService: ResilienceService
    ) { }

    @Post()
    async create(@Body() data: { productId: number; quantity: number }) {
        // تغليف استدعاء الخدمة داخل قاطع الدائرة لزيادة المرونة
        return this.resilienceService.fireAction(
            () => this.commandBus.execute(new CreateOrderCommand(data.productId, data.quantity))
        );
    }

    @Get()
    async findAll() {
        return this.queryBus.execute(new GetOrdersQuery());
    }

    @EventPattern('order_confirmed')
    async handleOrderConfirmed(@Payload() data: { orderId: number }) {
        console.log('Order confirmed message received:', data);
        await this.commandBus.execute(new ConfirmOrderCommand(data.orderId));
    }

    @EventPattern('order_rejected')
    async handleOrderRejected(@Payload() data: { orderId: number }) {
        console.log('Order rejected message received:', data);
        await this.commandBus.execute(new RejectOrderCommand(data.orderId));
    }
}
