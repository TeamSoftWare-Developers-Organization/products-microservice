import { Controller, Get, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('api/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  async getAllTransactions() {
    return this.paymentService.findAll();
  }

  @Get('order/:orderId')
  async getTransactionByOrderId(@Param('orderId') orderId: string) {
    return this.paymentService.findByOrderId(orderId);
  }
}
