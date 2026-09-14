import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { EventPattern, Payload } from '@nestjs/microservices';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateProductCommand } from './commands/impl/create-product.command';
import { UpdateProductCommand } from './commands/impl/update-product.command';
import { UpdateStockCommand } from './commands/impl/update-stock.command';
import { GetProductsQuery } from './queries/impl/get-products.query';
import { GetProductByIdQuery } from './queries/impl/get-product-by-id.query';
import { MinioService } from './minio.service';
import { Product } from './product.entity';
import { ProductsService } from './products.service';

@Controller('api/products')
export class ProductsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly minioService: MinioService,
    private readonly productsService: ProductsService,
  ) {}

  @Post('upload')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 8 * 1024 * 1024 } }))
  async uploadImage(@UploadedFile() file: any, @Request() req): Promise<{ imageUrl: string }> {
    if (req.user.role !== 'admin') throw new ForbiddenException('Only admins can upload images');
    if (!file) throw new BadRequestException('No file uploaded');
    if (!/^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype || '')) {
      throw new BadRequestException('Only JPEG, PNG, WEBP or GIF images are allowed');
    }
    return { imageUrl: await this.minioService.uploadFile(file) };
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async create(@Body() data: any, @Request() req): Promise<Product> {
    if (req.user.role !== 'admin') throw new ForbiddenException('Only admins can create products');
    const name = String(data.name || '').trim();
    const price = Number(data.price);
    const stock = Number(data.stock);
    if (!name) throw new BadRequestException('Product name is required');
    if (!Number.isFinite(price) || price < 0) throw new BadRequestException('A valid non-negative price is required');
    if (!Number.isInteger(stock) || stock < 0) throw new BadRequestException('Stock must be a non-negative integer');

    return this.commandBus.execute(new CreateProductCommand(
      name,
      price,
      stock,
      String(data.description || '').trim(),
      data.imageUrl ? String(data.imageUrl) : undefined,
      data.is_active ?? !Boolean(data.isFrozen),
    ));
  }

  @EventPattern('reduce_stock')
  async handleStockReduction(@Payload() data: { productId: number; quantity: number }) {
    return this.commandBus.execute(new UpdateStockCommand(data.productId, data.quantity));
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: string, @Body() data: any, @Request() req): Promise<Product> {
    if (req.user.role !== 'admin') throw new ForbiddenException('Only admins can update products');
    const numericId = Number(id);
    const price = Number(data.price);
    const stock = Number(data.stock);
    if (!Number.isInteger(numericId) || numericId <= 0) throw new BadRequestException('Invalid product id');
    if (!String(data.name || '').trim()) throw new BadRequestException('Product name is required');
    if (!Number.isFinite(price) || price < 0) throw new BadRequestException('Invalid price');
    if (!Number.isInteger(stock) || stock < 0) throw new BadRequestException('Invalid stock');

    return this.commandBus.execute(new UpdateProductCommand(
      numericId,
      String(data.name).trim(),
      price,
      stock,
      String(data.description || '').trim(),
      data.imageUrl ? String(data.imageUrl) : undefined,
      data.is_active ?? true,
    ));
  }

  @Get('admin/all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async getAllProductsForAdmin(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get()
  async getAllProducts(): Promise<Product[]> {
    return this.queryBus.execute(new GetProductsQuery());
  }

  @Get(':id')
  async getProductById(@Param('id') id: string): Promise<Product> {
    return this.queryBus.execute(new GetProductByIdQuery(Number(id)));
  }
}
