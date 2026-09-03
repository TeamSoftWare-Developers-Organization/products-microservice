"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./order.entity");
const resilience_service_1 = require("./resilience.service");
const microservices_1 = require("@nestjs/microservices");
let OrdersService = class OrdersService {
    constructor(ordersRepository, resilienceService, notificationClient, shippingClient, cartClient) {
        this.ordersRepository = ordersRepository;
        this.resilienceService = resilienceService;
        this.notificationClient = notificationClient;
        this.shippingClient = shippingClient;
        this.cartClient = cartClient;
    }
    async createOrder(productId, quantity, userId) {
        const order = this.ordersRepository.create({ productId, quantity, status: 'PENDING', userId });
        const savedOrder = await this.ordersRepository.save(order);
        console.log(`[Orders Service] Attempting to emit order_created via Breaker for order ${savedOrder.id}`);
        try {
            await this.resilienceService.fire('order_created', {
                orderId: savedOrder.id,
                productId,
                quantity,
                userId
            });
            this.notificationClient.emit('order_created', {
                orderId: savedOrder.id,
                productId,
                quantity,
                userId
            });
        }
        catch (error) {
            console.error(`[Orders Service] Circuit Breaker blocked/failed emit: ${error?.message || error}`);
        }
        return savedOrder;
    }
    async confirmOrder(orderId) {
        console.log(`[Orders Service] Confirming order ${orderId}`);
        const order = await this.ordersRepository.findOne({ where: { id: orderId } });
        await this.ordersRepository.update(orderId, { status: 'CONFIRMED' });
        this.notificationClient.emit('order_confirmed', { orderId, userId: order?.userId });
        this.cartClient.emit('order_confirmed', { orderId, userId: order?.userId });
        this.shippingClient.emit('order_confirmed_for_shipping', { orderId });
        console.log(`[Orders Service] Emitted order_confirmed_for_shipping for order ${orderId}`);
    }
    async rejectOrder(orderId) {
        console.log(`[Orders Service] Rejecting order ${orderId}`);
        await this.ordersRepository.update(orderId, { status: 'REJECTED' });
        this.notificationClient.emit('order_rejected', { orderId });
    }
    async findOne(id) {
        return this.ordersRepository.findOne({ where: { id } });
    }
    async failOrder(orderId) {
        console.log(`[Orders Service] Failing order ${orderId}`);
        const order = await this.ordersRepository.findOne({ where: { id: orderId } });
        if (!order) {
            console.error(`Order with ID ${orderId} not found for failing`);
            return;
        }
        order.status = 'FAILED';
        await this.ordersRepository.save(order);
        try {
            await this.resilienceService.fire('order.failed', {
                productId: order.productId,
                quantity: order.quantity
            });
            this.notificationClient.emit('order_failed', { orderId });
        }
        catch (error) {
            console.error(`[Orders Service] Failed to emit order.failed compensating event: ${error?.message || error}`);
        }
    }
    async findAll() {
        return this.ordersRepository.find();
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, common_1.Inject)('NOTIFICATION_SERVICE')),
    __param(3, (0, common_1.Inject)('SHIPPING_SERVICE')),
    __param(4, (0, common_1.Inject)('CART_SERVICE')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        resilience_service_1.ResilienceService,
        microservices_1.ClientProxy,
        microservices_1.ClientProxy,
        microservices_1.ClientProxy])
], OrdersService);
//# sourceMappingURL=orders.service.js.map