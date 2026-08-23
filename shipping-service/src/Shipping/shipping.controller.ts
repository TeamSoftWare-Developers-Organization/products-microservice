import {
    Controller, Get, Post, Patch, Param, Body,
    NotFoundException
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ShippingService } from './shipping.service.js';
import { DeliveryStatus } from './entities/delivery-ticket.entity.js';

@Controller('api/shipping')
export class ShippingController {
    constructor(private readonly shippingService: ShippingService) { }

    // =====================================================
    // RabbitMQ Event Handlers
    // =====================================================

    /**
     * يستمع لحدث تأكيد الطلب وينشئ بوليصة شحن تلقائياً
     */
    @EventPattern('order_confirmed_for_shipping')
    @EventPattern('order.confirmed')
    async handleOrderConfirmed(@Payload() data: { orderId: any; customerData?: any; totalAmount?: number }) {
        console.log(`[Shipping Controller] Received order confirmation payload:`, data);
        
        const orderId = String(data.orderId);
        const customerName = data.customerData?.name || 'Customer';
        const customerPhone = data.customerData?.phone || '0910000000';
        const city = data.customerData?.city || 'Tripoli';
        const address = data.customerData?.address || 'Tripoli, Libya';
        const codAmount = data.totalAmount || 0;
        const deliveryFee = 15.00; // قيمة افتراضية لرسوم التوصيل

        await this.shippingService.createDeliveryTicket({
            orderId,
            customerName,
            customerPhone,
            city,
            address,
            codAmount,
            deliveryFee,
        });
    }

    // =====================================================
    // REST API Endpoints (New Delivery Tickets & Cash Collections)
    // =====================================================

    /**
     * GET /api/shipping/tickets — جلب جميع تذاكر التوصيل
     */
    @Get('tickets')
    async getAllTickets() {
        return this.shippingService.findAllTickets();
    }

    /**
     * GET /api/shipping/tickets/:id — جلب تذكرة توصيل بالمعرف
     */
    @Get('tickets/:id')
    async getTicketById(@Param('id') id: string) {
        return this.shippingService.findTicketById(+id);
    }

    /**
     * GET /api/shipping/tickets/order/:orderId — جلب تذكرة توصيل بمعرف الطلب
     */
    @Get('tickets/order/:orderId')
    async getTicketByOrderId(@Param('orderId') orderId: string) {
        return this.shippingService.findTicketByOrderId(orderId);
    }

    /**
     * POST /api/shipping/tickets/:id/assign — تعيين سائق للمهمة
     * Body: { driverId: string }
     */
    @Post('tickets/:id/assign')
    async assignDriver(
        @Param('id') id: string,
        @Body() body: { driverId: string },
    ) {
        return this.shippingService.assignDriver(+id, body.driverId);
    }

    /**
     * PATCH /api/shipping/tickets/:id/status — تحديث حالة التوصيل
     * Body: { status: DeliveryStatus }
     */
    @Patch('tickets/:id/status')
    async updateDeliveryStatus(
        @Param('id') id: string,
        @Body() body: { status: DeliveryStatus },
    ) {
        return this.shippingService.updateDeliveryStatus(+id, body.status);
    }

    /**
     * POST /api/shipping/tickets/:id/collect — تسجيل استلام الكاش من السائق ومطابقته
     * Body: { driverId: string, amountReceived: number, accountantId?: string }
     */
    @Post('tickets/:id/collect')
    async collectCash(
        @Param('id') id: string,
        @Body() body: { driverId: string; amountReceived: number; accountantId?: string },
    ) {
        return this.shippingService.collectCash(
            +id,
            body.driverId,
            body.amountReceived,
            body.accountantId,
        );
    }

    /**
     * GET /api/shipping/collections — جلب كل تسويات الكاش المالي
     */
    @Get('collections')
    async getAllCashCollections() {
        return this.shippingService.findAllCashCollections();
    }

    // =====================================================
    // Legacy API Endpoints (For Backward Compatibility)
    // =====================================================

    /**
     * GET /api/shipping — جلب كل التذاكر (متوافق مع الكود القديم)
     */
    @Get()
    async findAllLegacy() {
        return this.shippingService.findAllTickets();
    }

    /**
     * GET /api/shipping/:id — جلب تذكرة بالمعرف
     */
    @Get(':id')
    async findOneLegacy(@Param('id') id: string) {
        return this.shippingService.findTicketById(+id);
    }

    /**
     * GET /api/shipping/order/:orderId — جلب تذكرة بمعرف الطلب
     */
    @Get('order/:orderId')
    async findByOrderLegacy(@Param('orderId') orderId: string) {
        return this.shippingService.findTicketByOrderId(orderId);
    }

    /**
     * PATCH /api/shipping/:id/status — تحديث حالة التذكرة
     */
    @Patch(':id/status')
    async updateStatusLegacy(
        @Param('id') id: string,
        @Body() body: { status: any; driverName?: string },
    ) {
        // خريطة التوافق
        let mappedStatus = DeliveryStatus.PENDING;
        if (body.status === 'IN_TRANSIT') mappedStatus = DeliveryStatus.PICKED_UP;
        if (body.status === 'DELIVERED') mappedStatus = DeliveryStatus.DELIVERED;
        if (body.status === 'RETURNED') mappedStatus = DeliveryStatus.RETURNED;

        if (body.driverName) {
            await this.shippingService.assignDriver(+id, body.driverName);
        }
        return this.shippingService.updateDeliveryStatus(+id, mappedStatus);
    }

    /**
     * POST /api/shipping/:id/collect-cash — تحصيل كاش
     */
    @Post(':id/collect-cash')
    async collectCashLegacy(
        @Param('id') id: string,
        @Body() body: { amountCollected: number; driverName?: string },
    ) {
        return this.shippingService.collectCash(
            +id,
            body.driverName || 'legacy_driver',
            body.amountCollected,
        );
    }
}
