import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ResilienceService } from './resilience.service';
export declare class OrdersController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly resilienceService;
    constructor(commandBus: CommandBus, queryBus: QueryBus, resilienceService: ResilienceService);
    create(data: {
        productId: number;
        quantity: number;
    }): Promise<any>;
    findAll(): Promise<any>;
    handleOrderConfirmed(data: {
        orderId: number;
    }): Promise<void>;
    handleOrderRejected(data: {
        orderId: number;
    }): Promise<void>;
}
