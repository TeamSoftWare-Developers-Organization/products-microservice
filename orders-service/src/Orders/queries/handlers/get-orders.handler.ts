import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrdersQuery } from '../impl/get-orders.query';
import { OrdersService } from '../../orders.service';

@QueryHandler(GetOrdersQuery)
export class GetOrdersHandler implements IQueryHandler<GetOrdersQuery> {
    constructor(private readonly ordersService: OrdersService) { }

    async execute(query: GetOrdersQuery) {
        return this.ordersService.findAll();
    }
}
