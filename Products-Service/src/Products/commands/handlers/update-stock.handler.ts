import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateStockCommand } from '../impl/update-stock.command';
import { ProductsService } from '../../products.service';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@CommandHandler(UpdateStockCommand)
export class UpdateStockHandler implements ICommandHandler<UpdateStockCommand> {
    constructor(
        private readonly productsService: ProductsService,
        @Inject('ORDER_SERVICE') private client: ClientProxy
    ) { }

    async execute(command: UpdateStockCommand) {
        const { productId, quantity, orderId } = command;
        console.log(`[CQRS Command] Reducing stock for product ${productId} by ${quantity}`);

        const success = await this.productsService.updateStock(productId, quantity);

        if (orderId) {
            if (success) {
                console.log(`[CQRS] Stock reduced for order ${orderId}. Confirming...`);
                this.client.emit('order_confirmed', { orderId });
            } else {
                console.log(`[CQRS] Insufficient stock for order ${orderId}. Rejecting...`);
                this.client.emit('order_rejected', { orderId });
            }
        }

        return success;
    }
}
