import { Header } from "@/components/Header";
import { HomeClient } from "@/components/HomeClient";
import { Product } from "@/types";

export const dynamic = "force-dynamic";

async function getProducts(): Promise<Product[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.INTERNAL_API_URL ||
      "https://policies-strategic-rotation-extends.trycloudflare.com";

    const cleanBase = baseUrl.replace(/\/+$/, "");
    const url = cleanBase.endsWith("/api")
      ? `${cleanBase}/products`
      : `${cleanBase}/api/products`;

    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch (error) {
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-10 lg:p-12 bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-10">
        <Header />
        <HomeClient initialProducts={products} />
      </div>
    </main>
  );
}

