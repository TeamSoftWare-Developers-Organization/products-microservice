import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { WarehouseService } from '../warehouse.service';

@Controller()
export class PaymentFailedListener {
  constructor(private readonly warehouseService: WarehouseService) {}

  @EventPattern('payment_failed')
  @EventPattern('payment.failed')
  async handlePaymentFailed(@Payload() data: { orderId: string; reason: string }) {
    console.log(`🔄 [Warehouse Saga Recovery] Releasing reserved stock for Order ${data.orderId} due to: ${data.reason}`);
    await this.warehouseService.releaseStockByOrderId(data.orderId);
  }
}
