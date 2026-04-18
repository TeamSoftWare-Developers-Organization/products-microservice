import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsGateway } from './notifications.gateway';

@Controller()
export class NotificationsController {
    constructor(private readonly gateway: NotificationsGateway) { }

    @EventPattern('order_created')
    async handleOrderCreated(@Payload() data: any) {
        console.log('[Notification Service] Received order_created event:', data);
        this.gateway.sendOrderNotification({
            type: 'ORDER_CREATED',
            message: `تم استلام طلبك رقم ${data.orderId} بنجاح!`,
            data: data,
        });
    }

    @EventPattern('order_confirmed')
    async handleOrderConfirmed(@Payload() data: any) {
        console.log('[Notification Service] Received order_confirmed event:', data);
        this.gateway.sendOrderNotification({
            type: 'ORDER_CONFIRMED',
            message: `تم تأكيد طلبك رقم ${data.orderId} بنجاح!`,
            data: data,
        });
    }
}
