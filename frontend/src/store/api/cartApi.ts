import { baseApi } from './baseApi';

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  totalPrice: number;
}

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<Cart, void>({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),

    addToCart: builder.mutation<Cart, { productId: string; quantity: number }>({
      query: (body) => ({
        url: '/cart/items',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),

    clearCart: builder.mutation<void, void>({
      query: () => ({
        url: '/cart',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useClearCartMutation,
} = cartApi;
