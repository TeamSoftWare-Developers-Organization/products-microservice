"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { isAuthenticated, getUserRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getClientApiUrl } from "@/lib/config";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { EditProductModal } from "./EditProductModal";
import { useTranslation } from "@/lib/translations";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        setIsAdmin(getUserRole() === 'admin');
    }, []);

    const handleBuy = async () => {
        if (!isAuthenticated()) {
            router.push("/auth/login");
            return;
        }

        setLoading(true);
        try {
            const res = await apiFetch("/orders", {
                method: "POST",
                body: JSON.stringify({
                    productId: product.id,
                    quantity: 1
                })
            });

            if (res.status === 401) {
                router.push("/auth/login");
                return;
            }

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "فشل إنشاء الطلب");
            }

            toast({
                title: t("orderPlaced"),
                description: t("orderPlacedDesc", { name: product.name_ar || product.name || "منتج" }),
                variant: "success",
            });
            router.refresh();
        } catch (error: any) {
            toast({
                title: t("orderFailed"),
                description: error.message === "Failed to fetch" 
                    ? "تعذر الاتصال ببوابة الخوادم (تأكد من تشغيل النفق)" 
                    : (error.message || "Failed to place order"),
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const displayName = product.name_ar || product.name || "منتج";
    const displayDescription = product.description_ar || product.description || "";
    const displayPrice = Number(product.price_lyd ?? product.price ?? 0);
    const displayStock = Number(product.stock_quantity ?? product.stock ?? 0);
    const rawImage = product.main_image_url || product.imageUrl || "";

    // Resolve URL for display
    const displayImageUrl = rawImage
        ? rawImage.startsWith("/")
            ? `${getClientApiUrl()}${rawImage}`
            : rawImage
        : "";

    return (
        <Card className="group overflow-hidden rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between">
            <div>
                {/* Product Image */}
                <div className="relative w-full h-52 bg-card/40 dark:bg-background/40 flex items-center justify-center p-4 border-b border-border/50 overflow-hidden">
                    {displayImageUrl ? (
                        <img 
                            src={displayImageUrl} 
                            alt={displayName} 
                            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground/50">
                            <ShoppingCart className="w-12 h-12 mb-1 opacity-40" />
                            <span className="text-[11px]">لا توجد صورة</span>
                        </div>
                    )}

                    {/* Stock status badge */}
                    <div className="absolute top-3 end-3">
                        <span className={`text-[10px] font-bold px-2 py-0.8 rounded-full border backdrop-blur-md ${
                            displayStock > 0 
                                ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/30" 
                                : "bg-rose-500/10 text-rose-500 border-rose-500/30"
                        }`}>
                            {displayStock > 0 ? `${t("stock")}: ${displayStock}` : t("outOfStock")}
                        </span>
                    </div>
                </div>

                <CardHeader className="p-4 pb-2 space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-base text-foreground line-clamp-1 group-hover:text-emerald-500 transition-colors">
                            {displayName}
                        </h3>
                        <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                            {displayPrice.toLocaleString()} <span className="text-xs font-medium">LYD</span>
                        </span>
                    </div>
                    {displayDescription && (
                        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                            {displayDescription}
                        </p>
                    )}
                </CardHeader>
            </div>

            <CardFooter className="p-4 pt-2 flex items-center gap-2">
                <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    disabled={displayStock <= 0 || loading}
                    onClick={handleBuy}
                >
                    {loading ? t("processing") : (
                        <>
                            <ShoppingCart className="mx-1 h-3.5 w-3.5" /> 
                            <span>{t("buyNow")}</span>
                        </>
                    )}
                </Button>
                {isAdmin && (
                    <div className="shrink-0">
                        <EditProductModal product={product} />
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
