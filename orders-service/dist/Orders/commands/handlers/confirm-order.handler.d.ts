import { ICommandHandler } from '@nestjs/cqrs';
import { ConfirmOrderCommand } from '../impl/confirm-order.command';
import { OrdersService } from '../../orders.service';
export declare class ConfirmOrderHandler implements ICommandHandler<ConfirmOrderCommand> {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    execute(command: ConfirmOrderCommand): Promise<void>;
}
