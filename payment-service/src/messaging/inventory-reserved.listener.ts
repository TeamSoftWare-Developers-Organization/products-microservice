import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PaymentService } from '../payment.service';

@Controller()
export class InventoryReservedListener {
  constructor(private readonly paymentService: PaymentService) {}

  @EventPattern('inventory_reserved')
  @EventPattern('inventory.reserved')
  async handleInventoryReserved(@Payload() data: { orderId: string; userId?: string; totalAmount?: number; gateway?: string }) {
    const { orderId } = data;
    console.log(`💳 [Payment Service] Processing payment for Order ${orderId} via ${data.gateway || 'SADAD'}`);
    
    try {
      let userId = data.userId;
      let totalAmount = data.totalAmount;
      let gateway = data.gateway;

      if (!userId || totalAmount === undefined) {
        // 1. استعلام تفاصيل الطلب للحصول على معرف المستخدم والكمية ومعرف المنتج
        const orderResponse = await fetch(`http://orders-ms:3003/api/orders/${orderId}`);
        if (!orderResponse.ok) {
          throw new Error(`Failed to fetch order: ${orderResponse.statusText}`);
        }
        const order = await orderResponse.json();
        userId = userId || order.userId || 'guest';

        // 2. استعلام تفاصيل المنتج للحصول على السعر من خدمة المنتجات
        const productResponse = await fetch(`http://products-ms:3002/api/products/${order.productId}`);
        if (!productResponse.ok) {
          throw new Error(`Failed to fetch product: ${productResponse.statusText}`);
        }
        const product = await productResponse.json();

        // 3. حساب القيمة الكلية
        const price = Number(product.price) || 3500;
        totalAmount = price * Number(order.quantity);

        // محاكاة الفشل إذا كان رقم المنتج هو 99 أو الكمية المطلوبة 99 أو 90
        gateway = gateway || (String(order.productId) === '99' || Number(order.quantity) === 99 || Number(order.quantity) === 90 ? 'FAIL' : 'SADAD');
      }

      const isPaymentSuccess = await this.paymentService.processLocalPayment(
        String(orderId), 
        userId || 'guest', 
        totalAmount || 0, 
        gateway || 'SADAD'
      );
      
      if (isPaymentSuccess) {
        // إطلاق حدث نجاح الدفع لتأكيد الطلب وتصفير السلة والتوصيل
        this.paymentService.emitEvent('payment_success', { orderId, userId, amount: totalAmount });
        this.paymentService.emitEvent('payment.success', { orderId, userId, amount: totalAmount });
      } else {
        // إطلاق حدث فشل الدفع لبدء الـ Rollback وتفريغ الحجز في المخازن
        this.paymentService.emitEvent('payment_failed', { orderId, reason: 'فشل في عملية الدفع الإلكتروني المحلي' });
        this.paymentService.emitEvent('payment.failed', { orderId, reason: 'فشل في عملية الدفع الإلكتروني المحلي' });
      }
    } catch (err) {
      console.error(`❌ [Payment Service] Error processing payment for Order ${orderId}:`, err.message);
      this.paymentService.emitEvent('payment_failed', { orderId, reason: err.message });
      this.paymentService.emitEvent('payment.failed', { orderId, reason: err.message });
    }
  }
}
