import { baseApi } from './baseApi';
import { CartItem } from './cartApi';

export interface Order {
  id: string;
  status: 'PENDING' | 'INVENTORY_RESERVED' | 'PAID' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
}

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<Order, { items: CartItem[]; shippingAddress: string }>({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Orders', 'Cart'],
    }),

    getOrderById: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Orders', id }],
    }),
  }),
});

export const { useCreateOrderMutation, useGetOrderByIdQuery } = ordersApi;
