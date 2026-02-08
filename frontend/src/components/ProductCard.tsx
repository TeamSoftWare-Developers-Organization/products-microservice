"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, LogIn } from "lucide-react";
import { Product } from "@/types";
import { getToken, isAuthenticated } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleBuy = async () => {
        if (!isAuthenticated()) {
            router.push("/auth/login");
            return;
        }

        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch("http://localhost:8080/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
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
                const data = await res.json();
                throw new Error(data.message || "Failed to create order");
            }

            alert("Order placed successfully!");
            router.refresh();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
                <CardTitle className="flex justify-between items-start">
                    <span>{product.name_ar}</span>
                    <span className="text-xl font-bold text-primary">{Number(product.price_lyd).toLocaleString()} LYD</span>
                </CardTitle>
                <CardDescription>{product.description_ar}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Stock: <span className={product.stock_quantity > 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                        {product.stock_quantity > 0 ? product.stock_quantity : "Out of Stock"}
                    </span></span>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    disabled={product.stock_quantity <= 0 || loading}
                    onClick={handleBuy}
                >
                    {loading ? "Processing..." : (
                        <>
                            <ShoppingCart className="mr-2 h-4 w-4" /> Buy Now
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
