'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, PackageCheck, PackageX, Boxes, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from '@/lib/translations';
import { ProductCard } from '@/components/ProductCard';
import { AddProductModal } from '@/components/AddProductModal';
import { Product } from '@/types';
import { useGetAdminProductsQuery, useGetProductsQuery } from '@/store/api/productsApi';
import { Input } from '@/components/ui/input';

interface HomeClientProps { initialProducts: Product[]; adminMode?: boolean; }

type StockFilter = 'all' | 'available' | 'low' | 'out';

export function HomeClient({ initialProducts, adminMode = false }: HomeClientProps) {
  const { t, dir } = useTranslation();
  const [query, setQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const publicQuery = useGetProductsQuery(undefined, { skip: adminMode });
  const adminQuery = useGetAdminProductsQuery(undefined, { skip: !adminMode });
  const activeQuery = adminMode ? adminQuery : publicQuery;
  const { data: clientProducts, isLoading, isFetching, refetch } = activeQuery;
  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener('products:changed', handler);
    return () => window.removeEventListener('products:changed', handler);
  }, [refetch]);
  const products = clientProducts ?? initialProducts ?? [];

  const stats = useMemo(() => {
    const available = products.filter((p) => Number(p.stock_quantity ?? p.stock ?? 0) > 0).length;
    const low = products.filter((p) => {
      const s = Number(p.stock_quantity ?? p.stock ?? 0);
      return s > 0 && s <= 5;
    }).length;
    return { total: products.length, available, low, out: products.length - available };
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      const name = String(product.name_ar || product.name || '').toLowerCase();
      const desc = String(product.description_ar || product.description || '').toLowerCase();
      const stock = Number(product.stock_quantity ?? product.stock ?? 0);
      const matchesSearch = !q || name.includes(q) || desc.includes(q);
      const matchesStock = stockFilter === 'all' ||
        (stockFilter === 'available' && stock > 0) ||
        (stockFilter === 'low' && stock > 0 && stock <= 5) ||
        (stockFilter === 'out' && stock <= 0);
      return matchesSearch && matchesStock;
    });
  }, [products, query, stockFilter]);

  const cards = [
    { label: 'إجمالي المنتجات', value: stats.total, icon: Boxes },
    { label: 'متوفر', value: stats.available, icon: PackageCheck },
    { label: 'مخزون منخفض', value: stats.low, icon: SlidersHorizontal },
    { label: 'غير متوفر', value: stats.out, icon: PackageX },
  ];

  return (
    <div className="space-y-6 md:space-y-8" dir={dir}>
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="surface-card p-4 md:p-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-black mt-1">{value}</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </section>

      <section className="surface-card p-4 md:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black">{t('catalogTitle')}</h2>
            <p className="text-sm text-muted-foreground mt-1">إدارة وعرض المنتجات المتاحة في المتجر من شاشة واحدة.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => refetch()} className="h-10 px-4 rounded-xl border border-border bg-background/50 text-sm hover:border-emerald-500/50 transition-colors">
              {isFetching ? 'جاري التحديث...' : 'تحديث'}
            </button>
            <AddProductModal />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث بالاسم أو الوصف..." className="pr-10 bg-background/60" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {([
              ['all', 'الكل'], ['available', 'متوفر'], ['low', 'منخفض'], ['out', 'منتهي']
            ] as const).map(([key, label]) => (
              <button key={key} onClick={() => setStockFilter(key)} className={`h-10 px-4 rounded-xl text-sm font-semibold whitespace-nowrap border transition-all ${stockFilter === key ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-background/60 border-border text-muted-foreground hover:text-foreground'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {isLoading && products.length === 0 ? (
        <div className="surface-card text-center py-24"><div className="loader-ring mx-auto mb-4" /><p className="text-muted-foreground">جاري تحميل المنتجات...</p></div>
      ) : filtered.length === 0 ? (
        <div className="surface-card text-center py-24 px-6">
          <PackageX className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-bold">لا توجد منتجات مطابقة</h3>
          <p className="text-muted-foreground text-sm mt-2">غيّر البحث أو الفلتر، أو أضف منتجًا جديدًا إذا كنت مديرًا.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in">
          {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
}
