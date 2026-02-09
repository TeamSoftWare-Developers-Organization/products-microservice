import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrderCommand } from '../impl/create-order.command';
import { OrdersService } from '../../orders.service';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
    constructor(private readonly ordersService: OrdersService) { }

    async execute(command: CreateOrderCommand) {
        return this.ordersService.createOrder(command.productId, command.quantity);
    }
}
