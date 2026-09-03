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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOrdersHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const get_orders_query_1 = require("../impl/get-orders.query");
const orders_service_1 = require("../../orders.service");
let GetOrdersHandler = class GetOrdersHandler {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async execute(query) {
        return this.ordersService.findAll();
    }
};
exports.GetOrdersHandler = GetOrdersHandler;
exports.GetOrdersHandler = GetOrdersHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_orders_query_1.GetOrdersQuery),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], GetOrdersHandler);
//# sourceMappingURL=get-orders.handler.js.map