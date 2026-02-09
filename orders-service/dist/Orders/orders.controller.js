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
const get_orders_query_1 = require("./queries/impl/get-orders.query");
const confirm_order_command_1 = require("./commands/impl/confirm-order.command");
const reject_order_command_1 = require("./commands/impl/reject-order.command");
const resilience_service_1 = require("./resilience.service");
let OrdersController = class OrdersController {
    commandBus;
    queryBus;
    resilienceService;
    constructor(commandBus, queryBus, resilienceService) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.resilienceService = resilienceService;
    }
    async create(data) {
        return this.resilienceService.fireAction(() => this.commandBus.execute(new create_order_command_1.CreateOrderCommand(data.productId, data.quantity)));
    }
    async findAll() {
        return this.queryBus.execute(new get_orders_query_1.GetOrdersQuery());
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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, microservices_1.EventPattern)('order_confirmed'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "handleOrderConfirmed", null);
__decorate([
    (0, microservices_1.EventPattern)('order_rejected'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "handleOrderRejected", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('api/orders'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        resilience_service_1.ResilienceService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map