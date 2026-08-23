import { baseApi } from './baseApi';
import { Product } from '@/types';


export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // جلب المنتجات (Query)
    getProducts: builder.query<Product[], void>({
      query: () => '/products',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Products' as const, id })), { type: 'Products', id: 'LIST' }]
          : [{ type: 'Products', id: 'LIST' }],
    }),

    // إضافة منتج جديد (Mutation)
    addProduct: builder.mutation<Product, Partial<Product>>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }],
    }),

    // رفع صورة المنتج (Mutation)
    uploadProductImage: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({
        url: '/products/upload',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useAddProductMutation,
  useUploadProductImageMutation,
} = productsApi;
