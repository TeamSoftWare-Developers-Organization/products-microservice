export interface Ticket {
  id: string;
  orderId: string;
  status: string;
  shippingAddress: string;
  codAmount?: number;
}
