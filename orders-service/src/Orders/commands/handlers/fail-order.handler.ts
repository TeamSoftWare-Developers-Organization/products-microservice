import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FailOrderCommand } from '../impl/fail-order.command';
import { OrdersService } from '../../orders.service';

@CommandHandler(FailOrderCommand)
export class FailOrderHandler implements ICommandHandler<FailOrderCommand> {
    constructor(private readonly ordersService: OrdersService) { }

    async execute(command: FailOrderCommand) {
        return this.ordersService.failOrder(command.orderId);
    }
}
