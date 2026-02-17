import { ProductCard } from "@/components/ProductCard";
import { getApiUrl } from "@/lib/config";

import { Product } from "@/types";

import { Header } from "@/components/Header";
import { AddProductModal } from "@/components/AddProductModal";

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${getApiUrl()}/products`, {
      cache: "no-store", // SSR: Always fetch fresh data
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="min-h-screen p-8 md:p-24 bg-background">
      <div className="max-w-7xl mx-auto space-y-10">
        <Header />

        <div className="flex justify-end">
          <AddProductModal />
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-2">No products found</h2>
            <p className="text-muted-foreground">The store is currently empty or the backend is offline.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
