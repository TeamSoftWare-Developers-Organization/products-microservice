// src/Products/products.controller.ts

import { Controller, Get, Post, Body, Param, NotFoundException, Inject } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './product.entity';
import { EventPattern, Payload, ClientProxy } from '@nestjs/microservices';

@Controller('api/products') // نقطة النهاية الأساسية
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    @Inject('ORDER_SERVICE') private client: ClientProxy,
  ) { }


  @Post()
  async create(@Body() data: any): Promise<Product> {
    // ربط الحقول من الـ curl إلى الكيان (Entity)
    return this.productsService.create({
      name_ar: data.name,
      price_lyd: data.price,
      stock_quantity: data.stock,
      description_ar: data.description || '',
      is_active: true,
    });
  }

  // تأكد من أن الاسم هنا هو 'order_created' أو أي اسم تختاره
  @EventPattern('order_created')
  async handleOrderCreated(@Payload() data: { orderId: number; productId: number; quantity: number }) {
    console.log('Received order message:', data);
    const { orderId, productId, quantity } = data;

    const success = await this.productsService.updateStock(productId, quantity);

    if (success) {
      console.log(`[CQRS] Stock reduced for order ${orderId}. Confirming...`);
      this.client.emit('order_confirmed', { orderId });
    } else {
      console.log(`[CQRS] Insufficient stock for order ${orderId}. Rejecting...`);
      this.client.emit('order_rejected', { orderId });
    }
  }


  @EventPattern('reduce_stock')
  async handleStockReduction(@Payload() data: { productId: number; quantity: number }) {
    const { productId, quantity } = data;
    console.log(`[CQRS Command] Reducing stock for product ${productId} by ${quantity}`);
    return await this.productsService.updateStock(productId, quantity);
  }

  // GET /api/products
  @Get()
  async getAllProducts(): Promise<Product[]> {
    return this.productsService.findAllActive();
  }

  // GET /api/products/:id
  @Get(':id')
  async getProductById(@Param('id') id: string): Promise<Product> {
    const product = await this.productsService.findOneById(+id);
    if (!product || !product.is_active) {
      throw new NotFoundException(`Product with ID ${id} not found or is inactive.`);
    }
    return product;
  }
}