// src/products/products.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) { }

  // جلب جميع المنتجات النشطة
  async findAllActive(): Promise<Product[]> {
    return this.productsRepository.find({
      where: { is_active: true },
    });
  }

  // وظيفة جلب منتج واحد بالـ ID
  async findOneById(id: number): Promise<Product | null> {
    return this.productsRepository.findOneBy({ id });
  }

  // إضافة منتج جديد
  async create(data: Partial<Product>): Promise<Product> {
    const newProduct = this.productsRepository.create(data);
    return await this.productsRepository.save(newProduct);
  }

  // تحديث المخزون مع التحقق (Saga Pattern)
  async updateStock(productId: number, quantity: number): Promise<boolean> {
    const product = await this.productsRepository.findOne({ where: { id: productId } });

    if (!product) {
      console.error(`Product with ID ${productId} not found`);
      return false;
    }

    if (product.stock_quantity < quantity) {
      console.error(`Insufficient stock for product ${product.name_ar}. Current: ${product.stock_quantity}, Requested: ${quantity}`);
      return false;
    }

    product.stock_quantity -= quantity;
    console.log(`Updating stock for ${product.name_ar}: New Stock = ${product.stock_quantity}`);
    await this.productsRepository.save(product);
    return true;
  }
}