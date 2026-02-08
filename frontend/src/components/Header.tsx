"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { logout, isAuthenticated } from "@/lib/auth";
import Link from "next/link";
import { LogOut, LogIn, ShoppingCart } from "lucide-react";

export function Header() {
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        setIsAuth(isAuthenticated());
    }, []);

    return (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <Link href="/">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2 text-primary cursor-pointer">
                        MicroStore
                    </h1>
                </Link>
                <p className="text-muted-foreground text-lg">
                    Premium microservices-powered shopping.
                </p>
            </div>
            <div className="flex gap-2">
                {isAuth ? (
                    <Button variant="outline" onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                ) : (
                    <Link href="/auth/login">
                        <Button variant="outline">
                            <LogIn className="mr-2 h-4 w-4" /> Login
                        </Button>
                    </Link>
                )}
                <Button>
                    <ShoppingCart className="mr-2 h-4 w-4" /> Cart (0)
                </Button>
            </div>
        </div>
    );
}
