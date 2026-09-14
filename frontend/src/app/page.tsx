import { HomeClient } from '@/components/HomeClient';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';

async function getProducts(): Promise<Product[]> {
  try {
    // Server-side rendering must always prefer the internal container address.
    const baseUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://api-gateway-ms:8080';
    const cleanBase = baseUrl.replace(/\/+$/, '');
    const url = cleanBase.endsWith('/api') ? `${cleanBase}/products` : `${cleanBase}/api/products`;
    const res = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();
  return (
    <main className="min-h-[calc(100vh-8rem)] px-4 py-5 sm:px-6 md:px-8 lg:px-10 bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-7">
        <section className="hero-panel p-6 md:p-8 overflow-hidden relative">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">MICROSTORE COMMERCE CLOUD</span>
            <h2 className="text-3xl md:text-5xl font-black mt-4 leading-tight">متجر سريع، إدارة أوضح، وتشغيل موحّد للطلبات.</h2>
            <p className="text-muted-foreground mt-3 max-w-xl">واجهة عربية احترافية متصلة بخدمات المنتجات والسلة والطلبات والمخزون والدفع والشحن.</p>
          </div>
          <div className="absolute -left-16 -top-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />
        </section>
        <HomeClient initialProducts={products} />
      </div>
    </main>
  );
}
