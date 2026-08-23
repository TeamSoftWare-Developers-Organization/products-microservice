'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';
import WarehouseSelector from '@/components/cart/WarehouseSelector';
import CartItem from '@/components/cart/CartItem';
import { getClientApiUrl } from '@/lib/config';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<{ items: any[], totalPrice: number }>({ items: [], totalPrice: 0 });
  const [warehouseId, setWarehouseId] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { apiFetch } = await import('@/lib/api');
      const res = await apiFetch('/cart');
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  useNotifications((data) => {
    if (data.event === 'cartCleared') {
      setCart({ items: [], totalPrice: 0 });
    }
  });

  return (
    <div className="p-8 bg-zinc-950 text-white min-h-screen pt-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
          سلة المشتريات 🛒
        </h1>
        
        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-zinc-800 rounded"></div>
                <div className="h-4 bg-zinc-800 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : cart.items.length === 0 ? (
          <div className="text-center p-12 bg-zinc-900/30 backdrop-blur-sm rounded-2xl border border-zinc-800/50">
            <p className="text-xl text-zinc-400">السلة فارغة حالياً.</p>
            <button onClick={() => router.push('/')} className="mt-4 px-6 py-2 bg-emerald-600/20 text-emerald-400 rounded-full hover:bg-emerald-600/40 transition-all border border-emerald-500/30">
              تصفح المنتجات
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item: any) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </div>

            <div className="p-6 bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-zinc-700/50 space-y-6 h-fit sticky top-24 shadow-2xl">
              <h2 className="text-xl font-bold border-b border-zinc-800 pb-4 flex items-center justify-between">
                <span>ملخص الطلب</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-md">{cart.items.length} عناصر</span>
              </h2>
              
              <WarehouseSelector value={warehouseId} onChange={setWarehouseId} />

              <div className="flex justify-between items-center font-bold text-xl pt-4 border-t border-zinc-800/50">
                <span className="text-zinc-300">الإجمالي:</span>
                <span className="text-emerald-400 text-2xl">{cart.totalPrice} LYD</span>
              </div>

              <button 
                onClick={() => router.push(`/checkout?warehouse=${warehouseId}`)}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/50 flex justify-center items-center gap-2"
              >
                <span>متابعة للدفع</span>
                <span>➡️</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

