import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { ResilienceService } from './resilience.service';
import { ClientProxy } from '@nestjs/microservices';
export declare class OrdersService {
    private ordersRepository;
    private resilienceService;
    private notificationClient;
    private shippingClient;
    private cartClient;
    constructor(ordersRepository: Repository<Order>, resilienceService: ResilienceService, notificationClient: ClientProxy, shippingClient: ClientProxy, cartClient: ClientProxy);
    createOrder(productId: number, quantity: number, userId?: string): Promise<Order>;
    confirmOrder(orderId: number): Promise<void>;
    rejectOrder(orderId: number): Promise<void>;
    findOne(id: number): Promise<Order | null>;
    failOrder(orderId: number): Promise<void>;
    findAll(): Promise<Order[]>;
}
