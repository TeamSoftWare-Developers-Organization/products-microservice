import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CartService } from '../cart.service';

@Controller()
export class OrderConfirmedListener {
  constructor(private readonly cartService: CartService) {}

  /**
   * الاستماع لحدث تأكيد الطلب لتفريغ السلة فوراً من Redis
   */
  @EventPattern('order_confirmed')
  @EventPattern('order.confirmed')
  async handleOrderConfirmed(@Payload() data: { orderId: string; userId: string }) {
    console.log(`🛒 [Cart Service] Order ${data.orderId} is confirmed. Clearing Redis cart for user: ${data.userId}`);
    if (data.userId) {
      await this.cartService.clearCart(data.userId);
    } else {
      console.warn(`🛒 [Cart Service] Received order_confirmed event without userId!`);
    }
  }
}
