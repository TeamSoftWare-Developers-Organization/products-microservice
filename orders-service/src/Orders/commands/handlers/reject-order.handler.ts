import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RejectOrderCommand } from '../impl/reject-order.command';
import { OrdersService } from '../../orders.service';

@CommandHandler(RejectOrderCommand)
export class RejectOrderHandler implements ICommandHandler<RejectOrderCommand> {
    constructor(private readonly ordersService: OrdersService) { }

    async execute(command: RejectOrderCommand) {
        return this.ordersService.rejectOrder(command.orderId);
    }
}
