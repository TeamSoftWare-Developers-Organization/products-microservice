import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { WarehouseService } from '../warehouse.service';

@Controller()
export class OrderCreatedListener {
  constructor(private readonly warehouseService: WarehouseService) {}

  @EventPattern('order_created')
  @EventPattern('order.created')
  async handleOrderCreated(@Payload() data: { orderId: string; productId: string; quantity: number; warehouseId?: number }) {
    console.log(`📦 [Warehouse Service] Verifying stock for Order ${data.orderId}, Product ${data.productId}`);
    
    const targetWarehouseId = data.warehouseId || 1;
    const isReserved = await this.warehouseService.reserveStock(
      data.orderId, 
      data.productId, 
      data.quantity, 
      targetWarehouseId
    );
    
    if (isReserved) {
      // إرسال حدث نجاح الحجز ليستمر طابور الـ Saga
      this.warehouseService.emitEvent('inventory_reserved', { orderId: data.orderId, productId: data.productId });
      this.warehouseService.emitEvent('inventory.reserved', { orderId: data.orderId, productId: data.productId });
    } else {
      // إرسال حدث الفشل لإلغاء الطلب
      const reason = 'المخزون غير كافٍ في هذا الموقع الجغرافي';
      this.warehouseService.emitEvent('inventory_failed', { orderId: data.orderId, reason });
      this.warehouseService.emitEvent('inventory.failed', { orderId: data.orderId, reason });
    }
  }
}
