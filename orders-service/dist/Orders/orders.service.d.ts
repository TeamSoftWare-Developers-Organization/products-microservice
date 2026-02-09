import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { ResilienceService } from './resilience.service';
export declare class OrdersService {
    private ordersRepository;
    private resilienceService;
    constructor(ordersRepository: Repository<Order>, resilienceService: ResilienceService);
    createOrder(productId: number, quantity: number): Promise<Order>;
    confirmOrder(orderId: number): Promise<void>;
    rejectOrder(orderId: number): Promise<void>;
    findAll(): Promise<Order[]>;
}
