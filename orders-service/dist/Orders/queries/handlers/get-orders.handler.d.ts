import { IQueryHandler } from '@nestjs/cqrs';
import { GetOrdersQuery } from '../impl/get-orders.query';
import { OrdersService } from '../../orders.service';
export declare class GetOrdersHandler implements IQueryHandler<GetOrdersQuery> {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    execute(query: GetOrdersQuery): Promise<import("../../order.entity").Order[]>;
}
