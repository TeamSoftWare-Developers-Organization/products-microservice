"use client";

import React from "react";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS } from "@/lib/graphql-queries";
import { Product } from "@/types";

export default function StorefrontCatalog() {
  const { data, loading, error } = useQuery(GET_PRODUCTS);

  if (loading) return <div className="p-8 text-center">جاري جلب المنتجات من النظام المعماري...</div>;
  if (error) return <div className="p-8 text-center text-red-500">حدث خطأ أثناء تحميل الكتالوج: {error.message}</div>;

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">كتالوج منتجات SkyStore</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.products?.map((product: Product) => (
          <div key={product.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white flex flex-col justify-between">
            <div className="h-48 bg-slate-100 flex items-center justify-center overflow-hidden">
              <img
                src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/${product.imageUrl}`}
                alt={product.name}
                className="object-cover h-full w-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.png";
                }}
              />
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-lg text-slate-900">{product.name}</h3>
                <p className="text-slate-500 text-sm mt-1">{product.description}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xl font-bold text-emerald-600">${product.price.toFixed(2)}</span>
                <span className="text-xs text-slate-400">المتوفر: {product.stockQuantity}</span>
              </div>
              <button
                onClick={() => alert(`تمت إضافة ${product.name} إلى السلة!`)}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
              >
                إضافة إلى السلة
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
