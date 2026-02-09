import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductByIdQuery } from '../impl/get-product-by-id.query';
import { ProductsService } from '../../products.service';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetProductByIdQuery)
export class GetProductByIdHandler implements IQueryHandler<GetProductByIdQuery> {
    constructor(private readonly productsService: ProductsService) { }

    async execute(query: GetProductByIdQuery) {
        const product = await this.productsService.findOneById(query.id);
        if (!product || !product.is_active) {
            throw new NotFoundException(`Product with ID ${query.id} not found or is inactive.`);
        }
        return product;
    }
}
