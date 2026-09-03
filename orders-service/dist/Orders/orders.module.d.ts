import { CreateOrderHandler } from './commands/handlers/create-order.handler';
import { ConfirmOrderHandler } from './commands/handlers/confirm-order.handler';
import { RejectOrderHandler } from './commands/handlers/reject-order.handler';
import { FailOrderHandler } from './commands/handlers/fail-order.handler';
import { GetOrdersHandler } from './queries/handlers/get-orders.handler';
export declare const CommandHandlers: (typeof CreateOrderHandler | typeof ConfirmOrderHandler | typeof RejectOrderHandler | typeof FailOrderHandler)[];
export declare const QueryHandlers: (typeof GetOrdersHandler)[];
export declare class OrdersModule {
}
