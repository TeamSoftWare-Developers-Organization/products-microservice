import { Controller, Get, Post, Delete, Body, UseGuards, Req, Param } from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from './guards/auth.guard';

@Controller('api/cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Req() req: any) {
    // Extract userId from JWT payload
    const userId = req.user?.sub || req.user?.id || 'guest';
    return await this.cartService.getCart(userId);
  }

  @Get(':userId')
  async getCartByUser(@Param('userId') userId: string) {
    return await this.cartService.getCart(userId);
  }

  @Post('add')
  async addToCart(@Req() req: any, @Body() itemDto: { productId: string; name_ar?: string; price: number; quantity: number }) {
    const userId = req.user?.sub || req.user?.id || 'guest';
    return await this.cartService.addItem(userId, itemDto);
  }

  @Post(':userId/items')
  async addItem(
    @Param('userId') userId: string,
    @Body() item: { productId: string; name_ar?: string; quantity: number; price: number },
  ) {
    return await this.cartService.addItem(userId, item);
  }

  @Delete('clear')
  async clearCart(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id || 'guest';
    await this.cartService.clearCart(userId);
    return { message: 'تم تفريغ السلة بنجاح' };
  }

  @Delete(':userId')
  async clearCartByUser(@Param('userId') userId: string) {
    return await this.cartService.clearCart(userId);
  }
}
