import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from './guards/auth.guard';

@Controller('api/cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private userId(req: any): string {
    return String(req.user?.sub || req.user?.id);
  }

  @Get()
  getCart(@Req() req: any) {
    return this.cartService.getCart(this.userId(req));
  }

  @Post('items')
  addToCart(@Req() req: any, @Body() itemDto: { productId: string; name_ar?: string; price: number; quantity: number; imageUrl?: string }) {
    return this.cartService.addItem(this.userId(req), itemDto);
  }

  @Patch('items/:productId')
  updateQuantity(@Req() req: any, @Param('productId') productId: string, @Body() body: { quantity: number }) {
    return this.cartService.updateQuantity(this.userId(req), productId, Number(body.quantity));
  }

  @Delete('items/:productId')
  removeItem(@Req() req: any, @Param('productId') productId: string) {
    return this.cartService.removeItem(this.userId(req), productId);
  }

  @Delete()
  async clearCart(@Req() req: any) {
    await this.cartService.clearCart(this.userId(req));
    return { message: 'تم تفريغ السلة بنجاح' };
  }
}
