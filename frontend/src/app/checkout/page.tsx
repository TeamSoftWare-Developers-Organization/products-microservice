'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Banknote, CheckCircle2, CreditCard, MapPin, Phone, User } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { notifyCartChanged } from '@/lib/cart-events';

function CheckoutContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const warehouse = Number(params.get('warehouse') || 1);
  const [gateway, setGateway] = useState<'CASH' | 'SADAD'>('CASH');
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<any>({ items: [], totalPrice: 0 });
  const [customer, setCustomer] = useState({ name: '', phone: '', city: '', address: '' });

  useEffect(() => {
    apiFetch('/cart').then((r) => r.ok ? r.json() : Promise.reject()).then(setCart).catch(() => router.push('/cart'));
  }, [router]);

  const setField = (field: keyof typeof customer, value: string) => setCustomer((prev) => ({ ...prev, [field]: value }));

  const placeOrder = async () => {
    if (!customer.name.trim() || !customer.phone.trim() || !customer.city.trim() || !customer.address.trim()) {
      return toast({ title: 'بيانات ناقصة', description: 'أكمل بيانات الاستلام قبل تأكيد الطلب.', variant: 'destructive' });
    }
    if (!cart.items?.length) return router.push('/cart');

    setLoading(true);
    try {
      const results = [];
      for (const item of cart.items) {
        const res = await apiFetch('/orders', {
          method: 'POST',
          body: JSON.stringify({
            productId: Number(item.productId), quantity: Number(item.quantity), unitPrice: Number(item.price || 0), warehouseId: warehouse,
            gateway, customerData: customer,
          }),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'فشل إنشاء الطلب');
        results.push(await res.json().catch(() => ({})));
      }
      await apiFetch('/cart', { method: 'DELETE' });
      notifyCartChanged({ count: 0 });
      toast({ title: 'تم إنشاء الطلب بنجاح', description: 'تم إرسال الطلب إلى منظومة المعالجة ويمكن متابعة حالته من لوحة اللوجستيات.', variant: 'success' });
      router.push('/admin/logistics');
    } catch (e: any) {
      toast({ title: 'تعذر إتمام الطلب', description: e.message || 'تحقق من المخزون والخدمات وحاول مجددًا.', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6" dir="rtl">
      <section className="surface-card p-5 md:p-7 space-y-6">
        <div><p className="text-xs font-bold text-emerald-500">CHECKOUT</p><h1 className="text-2xl font-black mt-1">بيانات الاستلام والدفع</h1><p className="text-sm text-muted-foreground mt-1">أدخل بيانات صحيحة ليتمكن فريق التوصيل من خدمتك.</p></div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[['name','الاسم الكامل',User,'مثال: أحمد محمد'],['phone','رقم الهاتف',Phone,'09xxxxxxxx'],['city','المدينة',MapPin,'طرابلس'],['address','العنوان التفصيلي',MapPin,'المنطقة، الشارع، أقرب نقطة دالة']].map(([field,label,Icon,placeholder]: any) => <label key={field} className="space-y-2"><span className="text-sm font-semibold flex items-center gap-2"><Icon className="w-4 h-4 text-emerald-500"/>{label}</span><input value={(customer as any)[field]} onChange={(e) => setField(field, e.target.value)} placeholder={placeholder} className="w-full h-11 rounded-xl border border-input bg-background/60 px-3 outline-none focus:ring-2 focus:ring-emerald-500/30" /></label>)}
        </div>
        <div className="space-y-3"><h2 className="font-black">طريقة الدفع</h2><div className="grid sm:grid-cols-2 gap-3">
          <button onClick={() => setGateway('CASH')} className={`p-4 rounded-2xl border text-right transition-all ${gateway === 'CASH' ? 'border-emerald-500 bg-emerald-500/10' : 'border-border bg-background/40'}`}><Banknote className="w-6 h-6 text-emerald-500 mb-3"/><p className="font-bold">الدفع عند الاستلام</p><p className="text-xs text-muted-foreground mt-1">تسوية المبلغ مع مندوب التوصيل.</p></button>
          <button onClick={() => setGateway('SADAD')} className={`p-4 rounded-2xl border text-right transition-all ${gateway === 'SADAD' ? 'border-emerald-500 bg-emerald-500/10' : 'border-border bg-background/40'}`}><CreditCard className="w-6 h-6 text-emerald-500 mb-3"/><p className="font-bold">سداد SADAD</p><p className="text-xs text-muted-foreground mt-1">تسجيل طريقة الدفع الإلكترونية في الطلب.</p></button>
        </div></div>
      </section>
      <aside className="surface-card p-5 h-fit lg:sticky lg:top-6 space-y-5"><h2 className="font-black">ملخص الطلب</h2><div className="space-y-2 max-h-64 overflow-auto">{cart.items?.map((item: any) => <div key={item.productId} className="flex justify-between text-sm py-2 border-b border-border/50"><span className="truncate ml-3">{item.name_ar || `منتج #${item.productId}`} × {item.quantity}</span><b>{(item.price * item.quantity).toLocaleString()} د.ل</b></div>)}</div><div className="flex justify-between border-t border-border pt-4"><span>الإجمالي</span><span className="text-xl font-black text-emerald-500">{Number(cart.totalPrice || 0).toLocaleString()} د.ل</span></div><button onClick={placeOrder} disabled={loading || !cart.items?.length} className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5"/>{loading ? 'جاري إنشاء الطلب...' : 'تأكيد الطلب'}</button></aside>
    </div>
  );
}

export default function CheckoutPage() {
  return <main className="min-h-screen bg-background px-4 py-8 md:py-12"><Suspense fallback={<div className="loader-ring mx-auto mt-20"/>}><CheckoutContent /></Suspense></main>;
}
