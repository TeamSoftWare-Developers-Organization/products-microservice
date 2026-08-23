import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from './shipment.entity.js';
import { DeliveryTicket, DeliveryStatus } from './entities/delivery-ticket.entity.js';
import { CashCollection } from './entities/cash-collection.entity.js';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ShippingService {
    constructor(
        @InjectRepository(Shipment)
        private shipmentsRepository: Repository<Shipment>,
        @InjectRepository(DeliveryTicket)
        private deliveryTicketsRepository: Repository<DeliveryTicket>,
        @InjectRepository(CashCollection)
        private cashCollectionsRepository: Repository<CashCollection>,
        @Inject('NOTIFICATION_SERVICE') private notificationClient: ClientProxy,
    ) { }

    /**
     * يُنشئ تذكرة شحن جديدة تلقائياً عند تأكيد الطلب.
     */
    async createDeliveryTicket(data: {
        orderId: string;
        customerName: string;
        customerPhone: string;
        city: string;
        address: string;
        codAmount: number;
        deliveryFee: number;
    }): Promise<DeliveryTicket> {
        // التحقق من عدم وجود تذكرة مسبقاً لنفس الطلب (لتجنب التكرار)
        const existing = await this.deliveryTicketsRepository.findOne({ where: { orderId: data.orderId } });
        if (existing) {
            console.log(`[Shipping Service] Delivery ticket already exists for order ${data.orderId}. Skipping.`);
            return existing;
        }

        const ticket = this.deliveryTicketsRepository.create({
            orderId: data.orderId,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            city: data.city,
            deliveryAddress: data.address,
            codAmount: data.codAmount,
            deliveryFee: data.deliveryFee,
            status: DeliveryStatus.PENDING,
        });

        const saved = await this.deliveryTicketsRepository.save(ticket);
        console.log(`[Shipping Service] ✅ Delivery ticket created for order ${data.orderId}: Ticket ID = ${saved.id}`);

        // إشعار خدمة الإشعارات
        this.notificationClient.emit('shipping_created', {
            orderId: saved.orderId,
            ticketId: saved.id,
            status: saved.status,
            codAmount: saved.codAmount,
        });

        return saved;
    }

    /**
     * تعيين سائق/مندوب للتوصيل.
     */
    async assignDriver(ticketId: number, driverId: string): Promise<DeliveryTicket> {
        const ticket = await this.findTicketById(ticketId);

        ticket.driverId = driverId;
        ticket.status = DeliveryStatus.ASSIGNED;

        const updated = await this.deliveryTicketsRepository.save(ticket);
        console.log(`[Shipping Service] 🚚 Driver ${driverId} assigned to ticket ${ticketId}`);

        this.notificationClient.emit('shipping_status_updated', {
            ticketId: updated.id,
            orderId: updated.orderId,
            status: updated.status,
            driverId: updated.driverId,
        });

        return updated;
    }

    /**
     * تحديث حالة التوصيل (مثلاً: PICKED_UP, DELIVERED, RETURNED).
     */
    async updateDeliveryStatus(ticketId: number, status: DeliveryStatus): Promise<DeliveryTicket> {
        const ticket = await this.findTicketById(ticketId);

        const previousStatus = ticket.status;
        ticket.status = status;

        const updated = await this.deliveryTicketsRepository.save(ticket);
        console.log(`[Shipping Service] Ticket ${ticketId} status updated: ${previousStatus} → ${status}`);

        this.notificationClient.emit('shipping_status_updated', {
            ticketId: updated.id,
            orderId: updated.orderId,
            previousStatus,
            newStatus: updated.status,
        });

        return updated;
    }

    /**
     * مطابقة الكاش المالي وتسوية خزينة المندوب.
     */
    async collectCash(ticketId: number, driverId: string, amountReceived: number, accountantId?: string): Promise<CashCollection> {
        const ticket = await this.findTicketById(ticketId);

        // التحقق من أن القيمة المستلمة مطابقة لمبلغ COD المطلوب
        const isMatched = Number(amountReceived) === Number(ticket.codAmount);

        const collection = this.cashCollectionsRepository.create({
            deliveryTicketId: ticketId,
            driverId,
            amountReceived,
            isMatched,
            accountantId,
            settledAt: new Date(),
        });

        const savedCollection = await this.cashCollectionsRepository.save(collection);

        // إذا تم تسليم الشحنة بنجاح واستلام المبلغ، يتم تحديث الحالة إلى DELIVERED
        if (ticket.status !== DeliveryStatus.DELIVERED) {
            ticket.status = DeliveryStatus.DELIVERED;
            await this.deliveryTicketsRepository.save(ticket);
        }

        console.log(`[Shipping Service] 💰 Cash collection settled for ticket ${ticketId}. Matched = ${isMatched}`);

        this.notificationClient.emit('cash_collected', {
            ticketId,
            orderId: ticket.orderId,
            amountReceived,
            isMatched,
            driverId,
        });

        return savedCollection;
    }

    /**
     * جلب تذكرة توصيل بالمعرف.
     */
    async findTicketById(id: number): Promise<DeliveryTicket> {
        const ticket = await this.deliveryTicketsRepository.findOne({ where: { id } });
        if (!ticket) {
            throw new NotFoundException(`Delivery ticket with ID ${id} not found`);
        }
        return ticket;
    }

    /**
     * جلب تذكرة توصيل بمعرف الطلب.
     */
    async findTicketByOrderId(orderId: string): Promise<DeliveryTicket> {
        const ticket = await this.deliveryTicketsRepository.findOne({ where: { orderId } });
        if (!ticket) {
            throw new NotFoundException(`Delivery ticket for order ${orderId} not found`);
        }
        return ticket;
    }

    /**
     * جلب جميع تذاكر التوصيل.
     */
    async findAllTickets(): Promise<any[]> {
        const tickets = await this.deliveryTicketsRepository.find({ order: { createdAt: 'DESC' } });
        const collections = await this.cashCollectionsRepository.find();
        return tickets.map((ticket: any) => ({
            ...ticket,
            codStatus: collections.some((c: any) => c.deliveryTicketId === ticket.id) ? 'SETTLED' : 'PENDING'
        }));
    }

    /**
     * جلب جميع تسويات الكاش المالي.
     */
    async findAllCashCollections(): Promise<CashCollection[]> {
        return this.cashCollectionsRepository.find({ order: { settledAt: 'DESC' } });
    }

    // =====================================================
    // التوافقية مع الأساليب القديمة (Fallback for Compatibility)
    // =====================================================
    async createShipment(orderId: number): Promise<Shipment> {
        // نقوم بإنشاء تذكرة توصيل بقيم افتراضية لضمان عدم تعطل النظام القديم
        await this.createDeliveryTicket({
            orderId: orderId.toString(),
            customerName: 'Customer (Auto Created)',
            customerPhone: '0910000000',
            city: 'Tripoli',
            address: 'Tripoli, Libya',
            codAmount: 0,
            deliveryFee: 15.00,
        });

        // نقوم أيضاً بالإنشاء في جدول shipments القديم للتوافق
        const existing = await this.shipmentsRepository.findOne({ where: { orderId } });
        if (existing) return existing;

        const trackingCode = `SHIP-${orderId}-${Date.now().toString().slice(-6)}`;
        const shipment = this.shipmentsRepository.create({
            orderId,
            trackingCode,
        });
        return await this.shipmentsRepository.save(shipment);
    }
}
