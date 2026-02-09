"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = exports.QueryHandlers = exports.CommandHandlers = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const typeorm_1 = require("@nestjs/typeorm");
const order_entity_1 = require("./order.entity");
const orders_controller_1 = require("./orders.controller");
const orders_service_1 = require("./orders.service");
const resilience_service_1 = require("./resilience.service");
const microservices_1 = require("@nestjs/microservices");
const config_1 = require("@nestjs/config");
const create_order_handler_1 = require("./commands/handlers/create-order.handler");
const confirm_order_handler_1 = require("./commands/handlers/confirm-order.handler");
const reject_order_handler_1 = require("./commands/handlers/reject-order.handler");
const get_orders_handler_1 = require("./queries/handlers/get-orders.handler");
exports.CommandHandlers = [create_order_handler_1.CreateOrderHandler, confirm_order_handler_1.ConfirmOrderHandler, reject_order_handler_1.RejectOrderHandler];
exports.QueryHandlers = [get_orders_handler_1.GetOrdersHandler];
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([order_entity_1.Order]),
            microservices_1.ClientsModule.registerAsync([
                {
                    name: 'PRODUCT_SERVICE',
                    imports: [config_1.ConfigModule],
                    useFactory: (config) => ({
                        transport: microservices_1.Transport.RMQ,
                        options: {
                            urls: [config.get('RABBITMQ_URL') || 'amqp://rabbitmq:5672'],
                            queue: 'products_queue',
                            queueOptions: {
                                durable: false,
                            },
                        },
                    }),
                    inject: [config_1.ConfigService],
                },
            ]),
            cqrs_1.CqrsModule,
        ],
        controllers: [orders_controller_1.OrdersController],
        providers: [orders_service_1.OrdersService, resilience_service_1.ResilienceService, ...exports.CommandHandlers, ...exports.QueryHandlers],
    })
], OrdersModule);
//# sourceMappingURL=orders.module.js.map