import { ICommandHandler } from '@nestjs/cqrs';
import { CreateOrderCommand } from '../impl/create-order.command';
import { OrdersService } from '../../orders.service';
export declare class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    execute(command: CreateOrderCommand): Promise<import("../../order.entity").Order>;
}
