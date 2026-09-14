import { baseApi } from './baseApi';
import { Product } from '@/types';

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => '/products',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Products' as const, id })), { type: 'Products', id: 'LIST' }]
          : [{ type: 'Products', id: 'LIST' }],
    }),
    getAdminProducts: builder.query<Product[], void>({
      query: () => '/products/admin/all',
      providesTags: (result) => result ? [...result.map(({ id }) => ({ type: 'Products' as const, id })), { type: 'Products', id: 'LIST' }] : [{ type: 'Products', id: 'LIST' }],
    }),
    addProduct: builder.mutation<Product, { name: string; description?: string; price: number; stock: number; imageUrl?: string }>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }],
    }),
    updateProduct: builder.mutation<Product, { id: string | number; body: any }>({
      query: ({ id, body }) => ({ url: `/products/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'Products', id: arg.id }, { type: 'Products', id: 'LIST' }],
    }),
    uploadProductImage: builder.mutation<{ imageUrl: string }, FormData>({
      query: (formData) => ({ url: '/products/upload', method: 'POST', body: formData }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetAdminProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useUploadProductImageMutation,
} = productsApi;
