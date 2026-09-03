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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const microservices_1 = require("@nestjs/microservices");
const create_order_command_1 = require("./commands/impl/create-order.command");
const fail_order_command_1 = require("./commands/impl/fail-order.command");
const get_orders_query_1 = require("./queries/impl/get-orders.query");
const confirm_order_command_1 = require("./commands/impl/confirm-order.command");
const reject_order_command_1 = require("./commands/impl/reject-order.command");
const resilience_service_1 = require("./resilience.service");
const orders_service_1 = require("./orders.service");
let OrdersController = class OrdersController {
    constructor(commandBus, queryBus, resilienceService, ordersService) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.resilienceService = resilienceService;
        this.ordersService = ordersService;
    }
    async create(data, req) {
        console.log('[Orders Controller] Received create order body:', data);
        console.log('[Orders Controller] Received headers:', req.headers);
        let userId;
        try {
            const authHeader = req.headers.authorization;
            const [scheme, token] = authHeader?.split(' ') || [];
            switch (scheme?.toLowerCase()) {
                case 'bearer': {
                    const payloadBase64 = token?.split('.')[1];
                    switch (Boolean(payloadBase64)) {
                        case true: {
                            const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
                            const user = JSON.parse(payloadJson);
                            userId = user.sub || user.id;
                            console.log('[Orders Controller] Extracted userId from JWT:', userId);
                            break;
                        }
                        default:
                            break;
                    }
                    break;
                }
                default:
                    break;
            }
        }
        catch (e) {
            console.warn('[Orders Controller] Failed to decode JWT token:', e?.message || e);
        }
        return this.resilienceService.fireAction(() => this.commandBus.execute(new create_order_command_1.CreateOrderCommand(data.productId, data.quantity, userId)), 'createOrder');
    }
    async fail(id) {
        return this.commandBus.execute(new fail_order_command_1.FailOrderCommand(+id));
    }
    async findAll() {
        return this.queryBus.execute(new get_orders_query_1.GetOrdersQuery());
    }
    async findOne(id) {
        return this.ordersService.findOne(+id);
    }
    async handleOrderConfirmed(data) {
        console.log('Order confirmed message received:', data);
        await this.commandBus.execute(new confirm_order_command_1.ConfirmOrderCommand(data.orderId));
    }
    async handleOrderRejected(data) {
        console.log('Order rejected message received:', data);
        await this.commandBus.execute(new reject_order_command_1.RejectOrderCommand(data.orderId));
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/fail'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "fail", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findOne", null);
__decorate([
    (0, microservices_1.EventPattern)(['order_confirmed', 'payment.success', 'payment_success']),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "handleOrderConfirmed", null);
__decorate([
    (0, microservices_1.EventPattern)(['order_rejected', 'payment.failed', 'payment_failed', 'inventory.failed', 'inventory_failed']),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "handleOrderRejected", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('api/orders'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        resilience_service_1.ResilienceService,
        orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map