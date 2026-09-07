import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CartService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  private getCartKey(userId: string): string {
    return `cart:${userId}`;
  }

  // 1. Get current cart
  async getCart(userId: string): Promise<any> {
    const cartData = await this.redis.get(this.getCartKey(userId));
    return cartData ? JSON.parse(cartData) : { items: [], totalPrice: 0 };
  }

  // 2. Add or update product in cart
  async addToCart(userId: string, item: { productId: string; name_ar: string; price: number; quantity: number }) {
    const cart = await this.getCart(userId);
    
    // Check if the item already exists in the cart to update the quantity
    const existingItemIndex = cart.items.findIndex(i => i.productId === item.productId);
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += item.quantity;
    } else {
      cart.items.push(item);
    }

    // Recalculate total price
    const total = cart.items.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0);
    cart.total = total;
    cart.totalPrice = total;

    // Save cart in Redis with 7 days TTL (604800 seconds)
    await this.redis.set(this.getCartKey(userId), JSON.stringify(cart), 'EX', 604800);
    return cart;
  }

  async addItem(userId: string, item: { productId: string; name_ar?: string; price: number; quantity: number }) {
    return this.addToCart(userId, item as any);
  }

  // 3. Clear cart (usually after order placement)
  async clearCart(userId: string): Promise<void> {
    await this.redis.del(this.getCartKey(userId));
  }
}
