import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RestoreStockCommand } from '../impl/restore-stock.command';
import { ProductsService } from '../../products.service';

@CommandHandler(RestoreStockCommand)
export class RestoreStockHandler implements ICommandHandler<RestoreStockCommand> {
    constructor(private readonly productsService: ProductsService) { }

    async execute(command: RestoreStockCommand) {
        const { productId, quantity } = command;
        console.log(`[CQRS Command] Restoring stock for product ${productId} by ${quantity}`);
        return this.productsService.revertStock(productId, quantity);
    }
}
