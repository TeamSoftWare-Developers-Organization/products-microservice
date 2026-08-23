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
    cart.totalPrice = cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    // Save cart in Redis with 7 days TTL (604800 seconds)
    await this.redis.set(this.getCartKey(userId), JSON.stringify(cart), 'EX', 604800);
    return cart;
  }

  // 3. Clear cart (usually after order placement)
  async clearCart(userId: string): Promise<void> {
    await this.redis.del(this.getCartKey(userId));
  }
}
