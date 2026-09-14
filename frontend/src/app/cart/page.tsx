'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import WarehouseSelector from '@/components/cart/WarehouseSelector';
import CartItem from '@/components/cart/CartItem';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { notifyCartChanged } from '@/lib/cart-events';

interface CartData { items: any[]; totalPrice: number; }

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartData>({ items: [], totalPrice: 0 });
  const [warehouseId, setWarehouseId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | number | null>(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/cart');
      if (res.status === 401) return router.push('/auth/login');
      if (!res.ok) throw new Error('تعذر تحميل السلة');
      setCart(await res.json());
    } catch (e: any) {
      toast({ title: 'تعذر تحميل السلة', description: e.message, variant: 'destructive' });
    } finally { setLoading(false); }
  }, [router, toast]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const updateQuantity = async (productId: string | number, quantity: number) => {
    setBusyId(productId);
    try {
      const res = await apiFetch(`/cart/items/${productId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) });
      if (!res.ok) throw new Error('تعذر تحديث الكمية');
      const nextCart = await res.json();
      setCart(nextCart);
      notifyCartChanged({ count: (nextCart.items || []).reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0) });
    } catch (e: any) { toast({ title: 'خطأ', description: e.message, variant: 'destructive' }); }
    finally { setBusyId(null); }
  };

  const removeItem = async (productId: string | number) => {
    setBusyId(productId);
    try {
      const res = await apiFetch(`/cart/items/${productId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('تعذر حذف المنتج');
      const nextCart = await res.json();
      setCart(nextCart);
      notifyCartChanged({ count: (nextCart.items || []).reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0) });
    } catch (e: any) { toast({ title: 'خطأ', description: e.message, variant: 'destructive' }); }
    finally { setBusyId(null); }
  };

  const clearCart = async () => {
    if (!confirm('هل تريد تفريغ السلة بالكامل؟')) return;
    const res = await apiFetch('/cart', { method: 'DELETE' });
    if (res.ok) { setCart({ items: [], totalPrice: 0 }); notifyCartChanged({ count: 0 }); }
  };

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-8 md:py-12" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-emerald-500 font-bold">MICROSTORE CHECKOUT</p>
            <h1 className="text-3xl font-black mt-1">سلة المشتريات</h1>
            <p className="text-sm text-muted-foreground mt-1">راجع المنتجات والكمية قبل متابعة الطلب.</p>
          </div>
          <button onClick={() => router.push('/')} className="h-10 px-4 rounded-xl border border-border bg-card text-sm inline-flex items-center gap-2"><ArrowRight className="w-4 h-4" /> المتجر</button>
        </div>

        {loading ? <div className="surface-card py-24 text-center"><div className="loader-ring mx-auto" /></div> : cart.items.length === 0 ? (
          <div className="surface-card text-center py-24 px-6"><ShoppingBag className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" /><h2 className="text-xl font-bold">سلتك فارغة</h2><p className="text-sm text-muted-foreground mt-2">أضف منتجات من المتجر لتظهر هنا.</p><button onClick={() => router.push('/')} className="mt-5 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold">تصفح المنتجات</button></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            <section className="space-y-3">
              <div className="flex justify-between items-center mb-2"><p className="text-sm text-muted-foreground">{cart.items.length} منتج في السلة</p><button onClick={clearCart} className="text-xs text-rose-400 inline-flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> تفريغ السلة</button></div>
              {cart.items.map((item) => <CartItem key={item.productId} item={item} onUpdateQuantity={updateQuantity} onRemove={removeItem} busy={busyId === item.productId} />)}
            </section>
            <aside className="surface-card p-5 lg:sticky lg:top-6 space-y-5">
              <h2 className="font-black text-lg">ملخص الطلب</h2>
              <WarehouseSelector value={warehouseId} onChange={setWarehouseId} />
              <div className="space-y-2 text-sm"><div className="flex justify-between text-muted-foreground"><span>المنتجات</span><span>{cart.items.reduce((s, i) => s + i.quantity, 0)}</span></div><div className="flex justify-between text-muted-foreground"><span>الشحن</span><span>يحدد لاحقًا</span></div></div>
              <div className="border-t border-border pt-4 flex justify-between items-end"><span className="font-bold">الإجمالي</span><span className="text-2xl font-black text-emerald-500">{Number(cart.totalPrice).toLocaleString()} <small className="text-xs">د.ل</small></span></div>
              <button onClick={() => router.push(`/checkout?warehouse=${warehouseId}`)} className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black transition-colors">متابعة لإتمام الطلب</button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
