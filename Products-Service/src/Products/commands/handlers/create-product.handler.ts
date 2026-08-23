import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateProductCommand } from '../impl/create-product.command';
import { ProductsService } from '../../products.service';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand> {
    constructor(private readonly productsService: ProductsService) { }

    async execute(command: CreateProductCommand) {
        return this.productsService.create({
            name_ar: command.name_ar,
            price_lyd: command.price_lyd,
            stock_quantity: command.stock_quantity,
            description_ar: command.description_ar,
            main_image_url: command.main_image_url,
            is_active: true,
        });
    }
}
