// src/products/product.entity.ts

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name_ar: string; // اسم المنتج

  @Column({ type: 'text', nullable: true })
  description_ar: string; // الوصف

  @Column({ type: 'numeric', precision: 10, scale: 3 })
  price_lyd: number; // السعر بالدينار الليبي

  @Column({ type: 'varchar', length: 500, nullable: true })
  main_image_url: string; // رابط الصورة (من التخزين السحابي)

  @Column({ type: 'integer', default: 0 })
  stock_quantity: number; // الكمية المتوفرة (المخزون)

  @Column({ type: 'boolean', default: true })
  is_active: boolean; // حالة العرض على المتجر

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}