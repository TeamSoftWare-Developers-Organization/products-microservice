import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateProductCommand } from '../impl/update-product.command';
import { ProductsService } from '../../products.service';

@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler implements ICommandHandler<UpdateProductCommand> {
    constructor(private readonly productsService: ProductsService) { }

    async execute(command: UpdateProductCommand) {
        return this.productsService.update(command.id, {
            name_ar: command.name_ar,
            price_lyd: command.price_lyd,
            stock_quantity: command.stock_quantity,
            description_ar: command.description_ar,
            main_image_url: command.main_image_url,
            is_active: command.is_active !== undefined ? command.is_active : true,
        });
    }
}
