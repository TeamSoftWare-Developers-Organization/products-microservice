import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { WarehouseService } from '../warehouse.service';

@Controller()
export class OrderFailedListener {
  constructor(private readonly warehouseService: WarehouseService) {}

  @EventPattern('order_failed')
  @EventPattern('order.failed')
  @EventPattern('order_rejected')
  @EventPattern('order.rejected')
  async handleOrderFailed(@Payload() data: { orderId: string }) {
    const { orderId } = data;
    console.log(`🔄 [Warehouse Service] Order ${orderId} failed or was rejected. Querying order details to rollback stock...`);
    
    try {
      // استعلام تفاصيل الطلب للحصول على معرف المنتج والكمية لعمل rollback
      const response = await fetch(`http://orders-ms:3003/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch order details: ${response.statusText}`);
      }
      
      const order = await response.json();
      if (!order) {
        throw new Error(`No order data returned for ID ${orderId}`);
      }

      console.log(`🔄 [Warehouse Service] Releasing stock for Order ${orderId}: Product ${order.productId}, Quantity ${order.quantity}`);
      const targetWarehouseId = order.warehouseId || 1;
      await this.warehouseService.releaseStock(
        String(order.productId), 
        Number(order.quantity), 
        targetWarehouseId
      );
    } catch (err) {
      console.error(`❌ [Warehouse Service] Rollback failed for order ${orderId}:`, err.message);
    }
  }
}
