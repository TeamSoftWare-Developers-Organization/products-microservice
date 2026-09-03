import { Injectable, OnApplicationBootstrap, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { WarehouseInventory } from './entities/inventory.entity';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class WarehouseService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    @InjectRepository(WarehouseInventory)
    private readonly inventoryRepo: Repository<WarehouseInventory>,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
    @Inject('PAYMENT_RMQ_SERVICE') private readonly paymentClient: ClientProxy,
  ) {}

  // 1. حجز المخزون مؤقتاً (Reserve)
  async reserveStock(orderId: string, productId: string, quantity: number, warehouseId: number): Promise<boolean> {
    const targetWarehouseId = warehouseId || 1;
    console.log(`📦 [Warehouse Service] Attempting to reserve ${quantity} items of product ${productId} in warehouse ${targetWarehouseId} for order ${orderId}`);
    
    const inventory = await this.inventoryRepo.findOne({
      where: { product_id: productId, warehouse_id: targetWarehouseId }
    });

    if (!inventory) {
      console.warn(`📦 [Warehouse Service] No inventory record found for product ${productId} in warehouse ${targetWarehouseId}`);
      return false;
    }

    if (inventory.stock_quantity < quantity) {
      console.warn(`📦 [Warehouse Service] Insufficient stock for product ${productId} in warehouse ${targetWarehouseId}. Available: ${inventory.stock_quantity}, Requested: ${quantity}`);
      return false;
    }

    // نقل الكمية من المتوفر إلى المحجوز مؤقتاً لحماية الاتساق
    inventory.stock_quantity -= quantity;
    inventory.reserved_quantity += quantity;
    
    await this.inventoryRepo.save(inventory);
    console.log(`📦 [Warehouse Service] Successfully reserved ${quantity} of product ${productId} for order ${orderId}`);
    return true;
  }

  // 2. المعاملة التعويضية: إلغاء الحجز وإعادة المخزون (Rollback / Compensate)
  async releaseStock(productId: string, quantity: number, warehouseId: number) {
    const targetWarehouseId = warehouseId || 1;
    console.log(`🔄 [Warehouse Service] Releasing ${quantity} reserved items of product ${productId} in warehouse ${targetWarehouseId}`);
    
    const inventory = await this.inventoryRepo.findOne({
      where: { product_id: productId, warehouse_id: targetWarehouseId }
    });

    if (inventory) {
      inventory.stock_quantity += quantity;
      inventory.reserved_quantity = Math.max(0, inventory.reserved_quantity - quantity);
      await this.inventoryRepo.save(inventory);
      console.log(`🔄 [Warehouse Saga] Reverted temporary stock for product ${productId}`);
    } else {
      console.warn(`🔄 [Warehouse Service] Cannot release stock. No inventory record for product ${productId} in warehouse ${targetWarehouseId}`);
    }
  }

  async releaseStockByOrderId(orderId: string) {
    try {
      console.log(`🔄 [Warehouse Service] Fetching order details for rollback of Order ${orderId}`);
      const response = await fetch(`http://orders-ms:3003/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch order: ${response.statusText}`);
      }
      const order = await response.json();
      if (!order) {
        throw new Error(`No order data returned for ID ${orderId}`);
      }

      console.log(`🔄 [Warehouse Service] Releasing stock for Order ${orderId}: Product ${order.productId}, Quantity ${order.quantity}`);
      const targetWarehouseId = order.warehouseId || 1;
      await this.releaseStock(
        String(order.productId),
        Number(order.quantity),
        targetWarehouseId
      );
    } catch (err: any) {
      console.error(`❌ [Warehouse Service] releaseStockByOrderId failed for order ${orderId}:`, err.message);
    }
  }

  async getInventory() {
    return this.inventoryRepo.find();
  }

  // 3. بث الأحداث عبر RabbitMQ
  emitEvent(pattern: string, data: any) {
    if (pattern.startsWith('inventory.reserved') || pattern.startsWith('inventory_reserved')) {
      console.log(`📢 [Warehouse Service] Emitting event to Payment Queue: ${pattern}`, data);
      this.paymentClient.emit(pattern, data);
    } else {
      console.log(`📢 [Warehouse Service] Emitting event to Orders Queue: ${pattern}`, data);
      this.rabbitClient.emit(pattern, data);
    }
  }

  // 4. البذر التلقائي للبيانات عند بدء التطبيق
  async onApplicationBootstrap() {
    console.log('🌱 [Warehouse Service] Running database seeder check...');
    try {
      const warehouseCount = await this.warehouseRepo.count();
      if (warehouseCount === 0) {
        console.log('🌱 [Warehouse Service] No warehouses found. Seeding Tripoli and Benghazi warehouses...');
        const w1 = this.warehouseRepo.create({ name: 'مخزن طرابلس الرئيسي', location: 'طرابلس' });
        const w2 = this.warehouseRepo.create({ name: 'مخزن بنغازي 1', location: 'بنغازي' });
        await this.warehouseRepo.save([w1, w2]);
        console.log('🌱 [Warehouse Service] Warehouses seeded.');
      }

      const inventoryCount = await this.inventoryRepo.count();
      if (inventoryCount === 0) {
        console.log('🌱 [Warehouse Service] Seeding product inventory...');
        // بذر مخزون للمنتج رقم 9 و ps5_pro في طرابلس وبنغازي
        const items = [
          this.inventoryRepo.create({ warehouse_id: 1, product_id: '1', stock_quantity: 250 }),
          this.inventoryRepo.create({ warehouse_id: 1, product_id: '2', stock_quantity: 100 }),
          this.inventoryRepo.create({ warehouse_id: 2, product_id: '1', stock_quantity: 250 }),
          this.inventoryRepo.create({ warehouse_id: 2, product_id: '2', stock_quantity: 100 }),
        ];
        await this.inventoryRepo.save(items);
        console.log('🌱 [Warehouse Service] Inventory seeded successfully.');
      }
    } catch (err: any) {
      console.error('🌱 [Warehouse Service] Seeding failed:', err.message);
    }
  }
}
