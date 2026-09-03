import { Controller, Post, Body, Get, Param, Req } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateOrderCommand } from './commands/impl/create-order.command';
import { FailOrderCommand } from './commands/impl/fail-order.command';
import { GetOrdersQuery } from './queries/impl/get-orders.query';
import { ConfirmOrderCommand } from './commands/impl/confirm-order.command';
import { RejectOrderCommand } from './commands/impl/reject-order.command';
import { ResilienceService } from './resilience.service';
import { OrdersService } from './orders.service';

@Controller('api/orders')
export class OrdersController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly resilienceService: ResilienceService,
        private readonly ordersService: OrdersService
    ) { }

    @Post()
    async create(@Body() data: { productId: number; quantity: number }, @Req() req: any) {
        console.log('[Orders Controller] Received create order body:', data);
        console.log('[Orders Controller] Received headers:', req.headers);
        
        let userId: string | undefined;
        try {
            const authHeader = req.headers.authorization;
            const [scheme, token] = authHeader?.split(' ') || [];

            switch (scheme?.toLowerCase()) {
                case 'bearer': {
                    const payloadBase64 = token?.split('.')[1];
                    switch (Boolean(payloadBase64)) {
                        case true: {
                            const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
                            const user = JSON.parse(payloadJson);
                            userId = user.sub || user.id;
                            console.log('[Orders Controller] Extracted userId from JWT:', userId);
                            break;
                        }
                        default:
                            break;
                    }
                    break;
                }
                default:
                    break;
            }
        } catch (e: any) {
            console.warn('[Orders Controller] Failed to decode JWT token:', e?.message || e);
        }

        return this.resilienceService.fireAction(
            () => this.commandBus.execute(new CreateOrderCommand(data.productId, data.quantity, userId)),
            'createOrder'
        );
    }

    @Post(':id/fail')
    async fail(@Param('id') id: string) {
        return this.commandBus.execute(new FailOrderCommand(+id));
    }

    @Get()
    async findAll() {
        return this.queryBus.execute(new GetOrdersQuery());
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.ordersService.findOne(+id);
    }

    @EventPattern(['order_confirmed', 'payment.success', 'payment_success'])
    async handleOrderConfirmed(@Payload() data: { orderId: number }) {
        console.log('Order confirmed message received:', data);
        await this.commandBus.execute(new ConfirmOrderCommand(data.orderId));
    }

    @EventPattern(['order_rejected', 'payment.failed', 'payment_failed', 'inventory.failed', 'inventory_failed'])
    async handleOrderRejected(@Payload() data: { orderId: number }) {
        console.log('Order rejected message received:', data);
        await this.commandBus.execute(new RejectOrderCommand(data.orderId));
    }
}
