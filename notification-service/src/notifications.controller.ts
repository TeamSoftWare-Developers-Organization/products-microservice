import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MailerService } from '@nestjs-modules/mailer';
import { NotificationsGateway } from './notifications.gateway';

@Controller()
export class NotificationsController {
    constructor(
        private readonly mailerService: MailerService,
        private readonly gateway: NotificationsGateway,
    ) { }

    // =====================================================
    // أحداث الطلبات (Order Events)
    // =====================================================

    @EventPattern('order_created')
    @EventPattern('order.created')
    async handleOrderCreated(@Payload() data: any) {
        console.log('[Notification Service] order_created:', data);

        // 1. إشعار لحظي عبر السوكت (WebSockets)
        this.gateway.sendOrderNotification({
            type: 'ORDER_CREATED',
            message: `تم استلام طلبك رقم ${data.orderId || data.id} بنجاح! جاري مراجعته.`,
            data,
        });

        // 2. إرسال بريد إلكتروني بالفاتورة للزبون
        const customerEmail = data.customerEmail || data.email;
        if (customerEmail) {
            try {
                await this.mailerService.sendMail({
                    to: customerEmail,
                    subject: `تأكيد استلام طلبك رقم #${data.orderId || data.id}`,
                    html: `
                        <div dir="rtl" style="font-family: Arial; padding: 20px; background-color: #f4f4f5;">
                          <div style="background-color: white; padding: 20px; border-radius: 10px;">
                            <h2 style="color: #059669;">شكراً لتسوقك من MicroShop! 🛍️</h2>
                            <p>تم استلام طلبك بنجاح ونعمل على تجهيزه الآن.</p>
                            <hr style="border: 1px solid #e4e4e7;" />
                            <h3>تفاصيل الطلب:</h3>
                            <ul>
                              <li><strong>رقم الطلب:</strong> ${data.orderId || data.id}</li>
                              <li><strong>الإجمالي:</strong> ${data.totalAmount || data.total || 0} د.ل</li>
                            </ul>
                            <p>سيتواصل معك مندوبنا قريباً لتأكيد التسليم.</p>
                          </div>
                        </div>
                    `,
                });
                console.log(`✅ تم إرسال إيميل الفاتورة إلى: ${customerEmail}`);
            } catch (error: any) {
                console.error('❌ فشل إرسال الإيميل:', error.message);
            }
        }
    }

    @EventPattern('order_confirmed')
    async handleOrderConfirmed(@Payload() data: any) {
        console.log('[Notification Service] order_confirmed:', data);
        this.gateway.sendOrderNotification({
            type: 'ORDER_CONFIRMED',
            message: `✅ تم تأكيد طلبك رقم ${data.orderId} بنجاح! سيتم الشحن قريباً.`,
            data,
        });

        if (data.userId) {
            console.log(`[Notification Service] Broadcasting cart reset for user ${data.userId}`);
            this.gateway.sendNotification('cartCleared', {
                userId: data.userId,
                message: 'تم تحديث سلة مشترياتك وتفريغها بنجاح.'
            });
        }
    }

    @EventPattern('order_rejected')
    async handleOrderRejected(@Payload() data: any) {
        console.log('[Notification Service] order_rejected:', data);
        this.gateway.sendOrderNotification({
            type: 'ORDER_REJECTED',
            message: `❌ للأسف، تعذّر تنفيذ طلبك رقم ${data.orderId} بسبب نفاد المخزون.`,
            data,
        });
    }

    @EventPattern('order_failed')
    async handleOrderFailed(@Payload() data: any) {
        console.log('[Notification Service] order_failed:', data);
        this.gateway.sendOrderNotification({
            type: 'ORDER_FAILED',
            message: `⚠️ تم إلغاء طلبك رقم ${data.orderId}. سيتم استرجاع المخزون تلقائياً.`,
            data,
        });
    }

    // =====================================================
    // أحداث الشحن (Shipping Events)
    // =====================================================

    @EventPattern('shipping_created')
    async handleShippingCreated(@Payload() data: any) {
        console.log('[Notification Service] shipping_created:', data);
        this.gateway.sendOrderNotification({
            type: 'SHIPPING_CREATED',
            message: `🚚 تم إنشاء بوليصة الشحن لطلبك رقم ${data.orderId}. رقم التتبع: ${data.trackingCode}`,
            data,
        });
    }

    @EventPattern('shipping_status_updated')
    @EventPattern('shipping.status.updated')
    async handleShippingStatusUpdated(@Payload() data: any) {
        console.log('[Notification Service] shipping_status_updated:', data);
        const statusMessages: Record<string, string> = {
            IN_TRANSIT: `🛵 طلبك رقم ${data.orderId} في الطريق إليك الآن!`,
            DELIVERED: `🎉 تم تسليم طلبك رقم ${data.orderId} بنجاح!`,
            RETURNED: `↩️ تم إرجاع طلبك رقم ${data.orderId}. سيتم التواصل معك قريباً.`,
            AWAITING_PICKUP: `📦 طلبك رقم ${data.orderId} جاهز للاستلام من المستودع.`,
            PICKED_UP: `🛵 تم استلام طلبك رقم ${data.orderId} من المستودع وهو في الطريق إليك الآن!`,
        };
        const message = statusMessages[data.newStatus || data.status] || `تم تحديث حالة شحنة الطلب ${data.orderId}.`;
        
        this.gateway.sendOrderNotification({
            type: 'SHIPPING_STATUS_UPDATED',
            message,
            data,
        });

        this.gateway.sendNotification('orderStatusChanged', {
            orderId: String(data.orderId),
            status: data.newStatus || data.status,
            message,
        });
    }

    @EventPattern('cash_collected')
    @EventPattern('shipping.cash.settled')
    async handleCashCollected(@Payload() data: any) {
        console.log('[Notification Service] cash_collected:', data);
        const message = data.isMatched !== undefined
            ? (data.isMatched ? 'تمت تسوية ومطابقة أموال الطلب بنجاح' : 'تنبيه: يوجد عدم تطابق في الكاش المستلم!')
            : `💰 تم استلام مبلغ ${data.amountCollected || data.amountReceived} د.ل نقداً للطلب رقم ${data.orderId}.`;

        this.gateway.sendOrderNotification({
            type: 'CASH_COLLECTED',
            message,
            data,
        });

        this.gateway.sendNotification('cashSettled', {
            ticketId: data.ticketId || data.shipmentId,
            isMatched: data.isMatched ?? true,
            message,
        });
    }
}
