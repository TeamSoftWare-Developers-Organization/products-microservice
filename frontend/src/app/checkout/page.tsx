'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const warehouse = searchParams.get('warehouse') || '1';
  const { toast } = useToast();
  
  const [gateway, setGateway] = useState<string>('CASH'); // CASH, SADAD
  const [loading, setLoading] = useState<boolean>(false);

  const handlePlaceOrder = async () => {
    setLoading(true);
    
    try {
      // 1. Fetch current cart
      let itemsToOrder: Array<{ productId: number; quantity: number }> = [];
      try {
        const cartRes = await apiFetch('/cart');
        if (cartRes.ok) {
          const cartData = await cartRes.json();
          if (cartData && Array.isArray(cartData.items) && cartData.items.length > 0) {
            itemsToOrder = cartData.items.map((i: any) => ({
              productId: Number(i.productId) || 1,
              quantity: Number(i.quantity) || 1
            }));
          }
        }
      } catch (err) {
        console.warn("Could not fetch cart items, using default:", err);
      }

      // Default fallback if cart is empty
      if (itemsToOrder.length === 0) {
        itemsToOrder = [{ productId: 1, quantity: 1 }];
      }

      // 2. Place orders for all items in the cart
      for (const item of itemsToOrder) {
        const res = await apiFetch('/orders', {
          method: 'POST',
          body: JSON.stringify({
            productId: item.productId,
            quantity: item.quantity,
            warehouseId: Number(warehouse),
            gateway: gateway,
            customerData: {
              name: "زاهر محمد علي",
              phone: "0910000000",
              city: warehouse === '1' ? "طرابلس" : "بنغازي",
              address: "وسط المدينة"
            }
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'فشل إنشاء الطلب');
        }
      }

      // 3. Clear cart after successful checkout
      try {
        await apiFetch('/cart/clear', { method: 'DELETE' });
      } catch (e) {
        console.warn("Failed to clear cart:", e);
      }

      alert('تم إرسال طلبك بنجاح وجاري معالجته لحظياً عبر النظام الموزع! 🚀');
      router.push('/admin/logistics');
    } catch (err: any) {
      alert(`❌ ${err.message || 'حدث خطأ أثناء معالجة الطلب، قد يكون المخزون غير كافٍ.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-zinc-800/60 shadow-2xl text-white space-y-8">
      <h2 className="text-2xl font-bold border-b border-zinc-800/80 pb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
        بوابة الدفع وإتمام العملية 💳
      </h2>
      
      <div className="space-y-4">
        <label className="text-sm text-zinc-400 block font-medium">اختر طريقة الدفع المحلية:</label>
        
        <div 
          onClick={() => setGateway('CASH')}
          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${gateway === 'CASH' ? 'border-emerald-500 bg-emerald-950/30' : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-600'}`}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">💵</span>
            <span className="font-semibold text-lg">الدفع عند الاستلام</span>
          </div>
          {gateway === 'CASH' && <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>}
        </div>

        <div 
          onClick={() => setGateway('SADAD')}
          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${gateway === 'SADAD' ? 'border-emerald-500 bg-emerald-950/30' : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-600'}`}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">📱</span>
            <span className="font-semibold text-lg">خدمة سداد (SADAD)</span>
          </div>
          {gateway === 'SADAD' && <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>}
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-zinc-700 disabled:to-zinc-800 disabled:text-zinc-500 font-bold text-lg rounded-2xl transition-all shadow-lg hover:shadow-emerald-900/50 flex justify-center items-center gap-2 cursor-pointer"
      >
        {loading ? (
          <span className="animate-pulse">جاري تشغيل المعالجة... ⏳</span>
        ) : (
          <>
            <span>تأكيد وشراء الآن</span>
            <span>🚀</span>
          </>
        )}
      </button>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 pt-24 px-4">
      <Suspense fallback={<div className="text-center text-emerald-400 mt-20">جاري التحميل...</div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
