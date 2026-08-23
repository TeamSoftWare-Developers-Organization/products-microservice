"use client";

import { useTranslation } from "@/lib/translations";
import { ProductCard } from "@/components/ProductCard";
import { AddProductModal } from "@/components/AddProductModal";
import { Product } from "@/types";
import { useGetProductsQuery } from "@/store/api/productsApi";

interface HomeClientProps {
  initialProducts: Product[];
}

export function HomeClient({ initialProducts }: HomeClientProps) {
  const { t, dir } = useTranslation();
  const { data: clientProducts, isLoading } = useGetProductsQuery(undefined, {
    skip: initialProducts && initialProducts.length > 0,
  });

  const products = (initialProducts && initialProducts.length > 0)
    ? initialProducts
    : (clientProducts || []);

  return (
    <div className="space-y-6 md:space-y-8" dir={dir}>
      {/* Catalog Header & Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-border/40">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            {t("catalogTitle")}
            {products.length > 0 && (
              <span className="text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium">
                {products.length} {t("stock")}
              </span>
            )}
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            {t("catalogSubtitle")}
          </p>
        </div>

        <div className="shrink-0">
          <AddProductModal />
        </div>
      </div>

      {isLoading && products.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-muted-foreground text-sm">جاري تحميل المنتجات...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 bg-card/40 rounded-3xl border border-border/50 backdrop-blur-sm shadow-inner">
          <h2 className="text-xl md:text-2xl font-bold mb-2 text-foreground">{t("noProducts")}</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">{t("storeOffline")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 animate-fade-in">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

