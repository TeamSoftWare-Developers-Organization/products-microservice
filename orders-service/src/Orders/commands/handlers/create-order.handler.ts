import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrderCommand } from '../impl/create-order.command';
import { OrdersService } from '../../orders.service';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(private readonly ordersService: OrdersService) {}

  execute(command: CreateOrderCommand) {
    return this.ordersService.createOrder({
      productId: command.productId,
      quantity: command.quantity,
      userId: command.userId,
      warehouseId: command.warehouseId,
      gateway: command.gateway,
      customerData: command.customerData,
      unitPrice: command.unitPrice,
    });
  }
}
