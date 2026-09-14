import { HomeClient } from '@/components/HomeClient';

export default function AdminProductsPage() {
  return (
    <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-7xl mx-auto space-y-7">
        <div className="surface-card p-5 md:p-6">
          <p className="text-xs font-black text-emerald-500">PRODUCT OPERATIONS</p>
          <h1 className="text-2xl md:text-3xl font-black mt-1">إدارة المنتجات والمخزون</h1>
          <p className="text-sm text-muted-foreground mt-2">إضافة وتعديل المنتجات، رفع الصور، مراقبة المخزون والوصول السريع للكتالوج.</p>
        </div>
        <HomeClient initialProducts={[]} adminMode />
      </div>
    </main>
  );
}
