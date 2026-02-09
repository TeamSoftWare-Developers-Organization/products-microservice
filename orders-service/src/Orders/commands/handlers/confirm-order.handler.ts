import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfirmOrderCommand } from '../impl/confirm-order.command';
import { OrdersService } from '../../orders.service';

@CommandHandler(ConfirmOrderCommand)
export class ConfirmOrderHandler implements ICommandHandler<ConfirmOrderCommand> {
    constructor(private readonly ordersService: OrdersService) { }

    async execute(command: ConfirmOrderCommand) {
        return this.ordersService.confirmOrder(command.orderId);
    }
}
