import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentTransaction } from './entities/transaction.entity';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentTransaction)
    private readonly transactionRepo: Repository<PaymentTransaction>,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
    @Inject('WAREHOUSE_RMQ_SERVICE') private readonly warehouseClient: ClientProxy,
  ) {}

  // معالجة الدفع المحلي (سداد / تداول)
  async processLocalPayment(orderId: string, userId: string, amount: number, gateway: string): Promise<boolean> {
    console.log(`💳 [Payment Service] Processing payment transaction in database for Order ${orderId}`);
    
    const gatewayName = gateway || 'SADAD';
    const isSuccess = gatewayName.toUpperCase() !== 'FAIL';

    const transaction = this.transactionRepo.create({
      orderId,
      userId,
      amount,
      gateway: gatewayName,
      status: 'PENDING',
    });

    await this.transactionRepo.save(transaction);

    if (isSuccess) {
      transaction.status = 'SUCCESSFUL';
      transaction.transactionReference = `ref_${Math.random().toString(36).substring(2, 11)}`;
      await this.transactionRepo.save(transaction);
      console.log(`💳 [Payment Service] Payment SUCCESSFUL for Order ${orderId}. Reference: ${transaction.transactionReference}`);
      return true;
    } else {
      transaction.status = 'FAILED';
      await this.transactionRepo.save(transaction);
      console.log(`❌ [Payment Service] Payment FAILED for Order ${orderId} due to payment gate rejection.`);
      return false;
    }
  }

  // استرجاع جميع المعاملات اللحظية للإدارة
  async findAll(): Promise<PaymentTransaction[]> {
    return this.transactionRepo.find({ order: { createdAt: 'DESC' } });
  }

  // استرجاع معاملة برقم الطلب
  async findByOrderId(orderId: string): Promise<PaymentTransaction | null> {
    return this.transactionRepo.findOne({ where: { orderId } });
  }

  // بث الأحداث عبر RabbitMQ للخدمتين (Orders و Warehouse) لتجنب التعارض
  emitEvent(pattern: string, data: any) {
    console.log(`📢 [Payment Service] Emitting event: ${pattern} to Orders and Warehouse queues`, data);
    this.rabbitClient.emit(pattern, data);
    this.warehouseClient.emit(pattern, data);
  }
}
