import { Controller, Get, Post, Delete, Body, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from './guards/auth.guard';

@Controller('api/cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Req() req: any) {
    // Extract userId from JWT payload
    return await this.cartService.getCart(req.user.sub || req.user.id);
  }

  @Post('add')
  async addToCart(@Req() req: any, @Body() itemDto: { productId: string; name_ar: string; price: number; quantity: number }) {
    return await this.cartService.addToCart(req.user.sub || req.user.id, itemDto);
  }

  @Delete('clear')
  async clearCart(@Req() req: any) {
    await this.cartService.clearCart(req.user.sub || req.user.id);
    return { message: 'تم تفريغ السلة بنجاح' };
  }
}
