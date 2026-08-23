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
      product.is_active = false; // تجميد المنتج لعدم كفاية المخزون
      await this.productsRepository.save(product);
      return false;
    }

    product.stock_quantity -= quantity;
    if (product.stock_quantity === 0) {
      product.is_active = false; // تجميد المنتج لانتهاء المخزون (نفذت الكمية)
    }
    
    console.log(`Updating stock for ${product.name_ar}: New Stock = ${product.stock_quantity}, Active = ${product.is_active}`);
    await this.productsRepository.save(product);
    return true;
  }

  // إرجاع المخزون في حالة فشل الطلب (Compensating Transaction)
  async revertStock(productId: number, quantity: number): Promise<boolean> {
    const product = await this.productsRepository.findOne({ where: { id: productId } });

    if (!product) {
      console.error(`❌ Product ${productId} not found during compensation!`);
      return false;
    }

    // 1. إعادة الكمية المخصومة إلى المخزون
    product.stock_quantity += quantity;

    // 2. إعادة تنشيط المنتج تلقائياً بما أن المخزون عاد للتوفر
    if (!product.is_active) {
      product.is_active = true;
      console.log(`🔄 [Saga] Product ${product.name_ar} has been reactivated.`);
    }

    // 3. حفظ التعديلات في قاعدة البيانات
    await this.productsRepository.save(product);
    return true;
  }

  // تحديث بيانات المنتج
  async update(id: number, data: Partial<Product>): Promise<Product> {
    const product = await this.findOneById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    Object.assign(product, data);
    return await this.productsRepository.save(product);
  }
}