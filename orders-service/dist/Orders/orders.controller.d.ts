import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ResilienceService } from './resilience.service';
import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly resilienceService;
    private readonly ordersService;
    constructor(commandBus: CommandBus, queryBus: QueryBus, resilienceService: ResilienceService, ordersService: OrdersService);
    create(data: {
        productId: number;
        quantity: number;
    }, req: any): Promise<any>;
    fail(id: string): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<import("./order.entity").Order>;
    handleOrderConfirmed(data: {
        orderId: number;
    }): Promise<void>;
    handleOrderRejected(data: {
        orderId: number;
    }): Promise<void>;
}
