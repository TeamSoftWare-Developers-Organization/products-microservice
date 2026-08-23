import { Controller, Get, Post, Body, Param, NotFoundException, Inject, UseGuards, Request, ForbiddenException, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from './minio.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Product } from './product.entity';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateProductCommand } from './commands/impl/create-product.command';
import { UpdateStockCommand } from './commands/impl/update-stock.command';
import { GetProductsQuery } from './queries/impl/get-products.query';
import { GetProductByIdQuery } from './queries/impl/get-product-by-id.query';

@Controller('api/products') // نقطة النهاية الأساسية
export class ProductsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly minioService: MinioService,
  ) { }
  @Post('upload')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: any, @Request() req): Promise<{ imageUrl: string }> {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can upload images');
    }
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const imageUrl = await this.minioService.uploadFile(file);
    return { imageUrl };
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async create(@Body() data: any, @Request() req): Promise<Product> {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can create products');
    }
    // ربط الحقول من الـ curl إلى الكيان (Entity)
    return this.commandBus.execute(new CreateProductCommand(
      data.name,
      data.price,
      data.stock,
      data.description || '',
      data.imageUrl
    ));
  }

  // تأكد من أن الاسم هنا هو 'order_created' أو أي اسم تختاره
  // @EventPattern('order_created')
  // async handleOrderCreated(@Payload() data: { orderId: number; productId: number; quantity: number }) {
  //   console.log('Received order message:', data);
  //   const { orderId, productId, quantity } = data;
  //   await this.commandBus.execute(new UpdateStockCommand(productId, quantity, orderId));
  // }


  @EventPattern('reduce_stock')
  async handleStockReduction(@Payload() data: { productId: number; quantity: number }) {
    const { productId, quantity } = data;
    return await this.commandBus.execute(new UpdateStockCommand(productId, quantity));
  }

  // GET /api/products
  @Get()
  async getAllProducts(): Promise<Product[]> {
    return this.queryBus.execute(new GetProductsQuery());
  }

  // GET /api/products/:id
  @Get(':id')
  async getProductById(@Param('id') id: string): Promise<Product> {
    return this.queryBus.execute(new GetProductByIdQuery(+id));
  }
}