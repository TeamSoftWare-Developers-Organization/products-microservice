'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { ImageOff, Package, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { isAuthenticated, getUserRole } from '@/lib/auth';
import { resolveProductImage } from '@/lib/image';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { EditProductModal } from './EditProductModal';
import { addToCart } from '@/store/cartSlice';
import { notifyCartChanged } from '@/lib/cart-events';

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setIsAdmin(getUserRole() === 'admin'), []);

  const name = product.name_ar || product.name || 'منتج';
  const description = product.description_ar || product.description || 'بدون وصف';
  const price = Number(product.price_lyd ?? product.price ?? 0);
  const stock = Number(product.stock_quantity ?? product.stock ?? 0);
  const active = product.is_active !== false;
  const rawImage = product.main_image_url || product.imageUrl || '';
  const imageUrl = resolveProductImage(rawImage);

  const handleAddToCart = async () => {
    if (!isAuthenticated()) return router.push('/auth/login');
    setAddingToCart(true);
    try {
      const res = await apiFetch('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId: String(product.id), name_ar: name, price, quantity: 1, imageUrl }),
      });
      if (res.status === 401) return router.push('/auth/login');
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'تعذر إضافة المنتج للسلة');
      dispatch(addToCart(product));
      notifyCartChanged({ delta: 1 });
      toast({ title: 'تمت الإضافة إلى السلة', description: `${name} أصبح في سلة مشترياتك.`, variant: 'success' });
    } catch (error: any) {
      toast({ title: 'تعذر إضافة المنتج', description: error.message || 'حاول مرة أخرى.', variant: 'destructive' });
    } finally { setAddingToCart(false); }
  };

  const buyNow = async () => {
    setLoading(true);
    await handleAddToCart();
    setLoading(false);
    router.push('/cart');
  };

  return (
    <Card className="product-card overflow-hidden border-border/70 bg-card/70 backdrop-blur-xl flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary/40">
        {imageUrl && !imageFailed ? (
          <img src={imageUrl} alt={name} onError={() => setImageFailed(true)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2 bg-[radial-gradient(circle_at_center,rgba(16,185,129,.12),transparent_60%)]">
            {imageFailed ? <ImageOff className="w-10 h-10 opacity-50" /> : <Package className="w-10 h-10 opacity-50" />}
            <span className="text-xs">لا توجد صورة</span>
          </div>
        )}
        <span className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full border backdrop-blur ${stock > 5 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : stock > 0 ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' : 'bg-rose-500/15 text-rose-400 border-rose-500/20'}`}>
          {!active ? 'غير منشور' : stock > 0 ? `${stock} متوفر` : 'نفد المخزون'}
        </span>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg leading-tight line-clamp-1">{name}</CardTitle>
        <CardDescription className="line-clamp-2 min-h-10">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 flex-1">
        <div className="flex items-end justify-between gap-3">
          <div><p className="text-xs text-muted-foreground">السعر</p><p className="text-2xl font-black text-emerald-500">{price.toLocaleString('ar-LY', { maximumFractionDigits: 3 })} <span className="text-xs font-semibold">د.ل</span></p></div>
          <div className="text-xs text-muted-foreground">#{product.id}</div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-0">
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button variant="outline" onClick={handleAddToCart} disabled={!active || stock <= 0 || addingToCart} className="border-emerald-500/30 hover:bg-emerald-500/10">
            <ShoppingCart className="h-4 w-4 ml-1.5" />{addingToCart ? 'جاري...' : 'أضف للسلة'}
          </Button>
          <Button onClick={buyNow} disabled={!active || stock <= 0 || loading} className="bg-emerald-600 hover:bg-emerald-500 text-white">
            <ShoppingBag className="h-4 w-4 ml-1.5" />{loading ? 'جاري...' : 'اشتر الآن'}
          </Button>
        </div>
        {isAdmin && <div className="w-full"><EditProductModal product={product} /></div>}
      </CardFooter>
    </Card>
  );
}
