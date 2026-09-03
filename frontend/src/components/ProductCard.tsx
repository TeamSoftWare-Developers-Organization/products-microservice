"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ShoppingBag } from "lucide-react";
import { Product } from "@/types";
import { isAuthenticated, getUserRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getClientApiUrl } from "@/lib/config";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { EditProductModal } from "./EditProductModal";
import { useTranslation } from "@/lib/translations";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const router = useRouter();
    const dispatch = useDispatch();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        setIsAdmin(getUserRole() === 'admin');
    }, []);

    const displayName = product.name_ar || product.name || "منتج";
    const displayDescription = product.description_ar || product.description || "";
    const displayPrice = Number(product.price_lyd ?? product.price ?? 0);
    const displayStock = Number(product.stock_quantity ?? product.stock ?? 0);
    const rawImage = product.main_image_url || product.imageUrl || "";

    const handleAddToCart = async () => {
        if (!isAuthenticated()) {
            router.push("/auth/login");
            return;
        }

        setAddingToCart(true);
        try {
            // Update Redux state immediately for snappy UI
            dispatch(addToCart(product));

            // Sync with backend Cart microservice
            const res = await apiFetch("/cart/add", {
                method: "POST",
                body: JSON.stringify({
                    productId: String(product.id),
                    name_ar: displayName,
                    price: displayPrice,
                    quantity: 1
                })
            });

            if (res.status === 401) {
                router.push("/auth/login");
                return;
            }

            toast({
                title: "تمت الإضافة إلى السلة 🛒",
                description: `تم إضافة ${displayName} إلى سلة المشتريات.`,
                variant: "success",
            });
        } catch (error: any) {
            console.error("Cart error:", error);
            toast({
                title: "تنبيه",
                description: "تمت إضافة المنتج محلياً إلى السلة.",
                variant: "default",
            });
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        if (!isAuthenticated()) {
            router.push("/auth/login");
            return;
        }

        setLoading(true);
        try {
            await handleAddToCart();
            router.push("/cart");
        } finally {
            setLoading(false);
        }
    };

    // Resolve URL for display
    const displayImageUrl = rawImage
        ? rawImage.startsWith("/")
            ? `${getClientApiUrl()}${rawImage}`
            : rawImage
        : "";

    return (
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-border/50 bg-card/60 backdrop-blur-sm flex flex-col justify-between">
            <div>
                {displayImageUrl ? (
                    <div className="relative w-full h-48 overflow-hidden group">
                        <img 
                            src={displayImageUrl} 
                            alt={displayName} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                ) : (
                    <div className="w-full h-48 bg-linear-to-br from-primary/10 to-secondary/30 flex items-center justify-center border-b border-border/30">
                        <ShoppingCart className="w-12 h-12 text-muted-foreground/40" />
                    </div>
                )}
                <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                        <span>{displayName}</span>
                        <span className="text-xl font-bold text-primary">{displayPrice.toLocaleString()} LYD</span>
                    </CardTitle>
                    <CardDescription>{displayDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{t("stock")}: <span className={displayStock > 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                            {displayStock > 0 ? displayStock : t("outOfStock")}
                        </span></span>
                    </div>
                </CardContent>
            </div>

            <CardFooter className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2 w-full">
                    {/* Add to Cart button */}
                    <Button
                        variant="outline"
                        className="flex-1 border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 font-bold text-xs"
                        disabled={displayStock <= 0 || addingToCart}
                        onClick={handleAddToCart}
                    >
                        <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                        {addingToCart ? "جاري الإضافة..." : "أضف للسلة"}
                    </Button>

                    {/* Buy Now button */}
                    <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
                        disabled={displayStock <= 0 || loading}
                        onClick={handleBuyNow}
                    >
                        <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                        {loading ? t("processing") : t("buyNow")}
                    </Button>
                </div>

                <div className={`w-full transition-all duration-300 transform ${isAdmin ? "opacity-100 scale-100 visible" : "opacity-0 scale-90 invisible h-0 overflow-hidden"}`}>
                    <EditProductModal product={product} />
                </div>
            </CardFooter>
        </Card>
    );
}
