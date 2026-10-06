export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
}

export type ShipmentStatus = 'PREPARING' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED';

export interface Shipment {
  trackingNumber: string;
  status: ShipmentStatus;
  carrier: string;
  shippingAddress: string;
  estimatedDeliveryDate?: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}
