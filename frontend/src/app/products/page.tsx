"use client";

import { useGetProductsQuery } from '@/store/api/productsApi';
import { useAddToCartMutation } from '@/store/api/cartApi';
import { Loader2, ShoppingCart } from 'lucide-react';

export default function ProductsPage() {
  const { data: products, isLoading, isError } = useGetProductsQuery();
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();

  if (isLoading) return <div className="p-8 text-center min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 mx-auto text-emerald-500" /></div>;
  if (isError) return <div className="p-8 text-center text-red-500 font-medium">فشل في جلب المنتجات من البوابة</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-background min-h-screen">
      {products?.map((product) => (
        <div key={product.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-lg flex flex-col justify-between">
          <div>
            <img 
              src={product.imageUrl || product.main_image_url || "/file.svg"} 
              alt={product.name || product.name_ar || "منتج"} 
              className="h-48 w-full object-cover rounded-lg" 
            />
            <h2 className="font-bold text-lg mt-3 text-white">{product.name || product.name_ar || "منتج"}</h2>
            <p className="text-emerald-400 font-bold mt-1">{product.price ?? product.price_lyd ?? 0} د.ل</p>
          </div>

          <button
            onClick={() => addToCart({ productId: String(product.id), quantity: 1 })}
            disabled={isAdding}
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 py-2.5 rounded-lg flex justify-center items-center gap-2 text-white font-medium transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            إضافة للسلة
          </button>
        </div>
      ))}
    </div>
  );
}
