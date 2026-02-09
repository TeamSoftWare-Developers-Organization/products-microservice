import { ICommandHandler } from '@nestjs/cqrs';
import { RejectOrderCommand } from '../impl/reject-order.command';
import { OrdersService } from '../../orders.service';
export declare class RejectOrderHandler implements ICommandHandler<RejectOrderCommand> {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    execute(command: RejectOrderCommand): Promise<void>;
}
