import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

export interface CartItem {
  productId: string;
  name_ar?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

@Injectable()
export class CartService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  private getCartKey(userId: string): string { return `cart:${userId}`; }

  async getCart(userId: string): Promise<{ items: CartItem[]; totalPrice: number }> {
    const cartData = await this.redis.get(this.getCartKey(userId));
    return cartData ? JSON.parse(cartData) : { items: [], totalPrice: 0 };
  }

  private async save(userId: string, items: CartItem[]) {
    const normalized = items.filter((item) => item.quantity > 0);
    const totalPrice = normalized.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    const cart = { items: normalized, totalPrice: Number(totalPrice.toFixed(3)) };
    await this.redis.set(this.getCartKey(userId), JSON.stringify(cart), 'EX', 604800);
    return cart;
  }

  async addItem(userId: string, item: CartItem) {
    const quantity = Number(item.quantity);
    const price = Number(item.price);
    if (!item.productId || !Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('Invalid cart item');
    }
    const cart = await this.getCart(userId);
    const existing = cart.items.find((x) => String(x.productId) === String(item.productId));
    if (existing) existing.quantity += quantity;
    else cart.items.push({ ...item, productId: String(item.productId), price, quantity });
    return this.save(userId, cart.items);
  }

  async updateQuantity(userId: string, productId: string, quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 0) throw new BadRequestException('Quantity must be a non-negative integer');
    const cart = await this.getCart(userId);
    const item = cart.items.find((x) => String(x.productId) === String(productId));
    if (!item) return cart;
    item.quantity = quantity;
    return this.save(userId, cart.items);
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.getCart(userId);
    return this.save(userId, cart.items.filter((x) => String(x.productId) !== String(productId)));
  }

  async clearCart(userId: string): Promise<void> {
    await this.redis.del(this.getCartKey(userId));
  }
}
