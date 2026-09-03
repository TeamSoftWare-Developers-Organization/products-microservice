"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { logout, isAuthenticated } from "@/lib/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, LogIn, ShoppingCart, Shield, Home as HomeIcon, Warehouse, DollarSign, Sun, Moon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toggleTheme, toggleLanguage } from "@/store/slices/uiSlice";
import { useTranslation } from "@/lib/translations";
import { apiFetch } from "@/lib/api";

export function Header() {
    const [isAuth, setIsAuth] = useState(false);
    const pathname = usePathname();
    const dispatch = useDispatch();
    const { t, language, theme } = useTranslation();
    const [serverCartCount, setServerCartCount] = useState<number | null>(null);

    const reduxCartItems = useSelector((state: RootState) => state.cart?.items || []);
    const localCartCount = reduxCartItems.reduce((total, item) => total + (item.quantity || 1), 0);

    useEffect(() => {
        setIsAuth(isAuthenticated());
        
        // Fetch cart count from backend on load if authenticated
        if (isAuthenticated()) {
            apiFetch("/cart")
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data && Array.isArray(data.items)) {
                        const total = data.items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
                        setServerCartCount(total);
                    }
                })
                .catch(() => {});
        }
    }, [pathname]);

    const displayCartCount = serverCartCount !== null ? serverCartCount : localCartCount;

    const navLinks = [
        { href: "/", label: t("navHome"), icon: HomeIcon },
        { href: "/admin/permissions", label: t("navPermissions"), icon: Shield, badge: t("newBadge") },
        { href: "/admin/logistics", label: t("navLogistics"), icon: Warehouse },
        { href: "/admin/finance", label: t("navFinance"), icon: DollarSign },
    ];

    return (
        <header className="bg-card/90 backdrop-blur-xl border border-border/80 rounded-2xl md:rounded-3xl px-4 py-3 md:px-6 md:py-3.5 shadow-xl transition-all duration-300 w-full">
            <div className="flex flex-wrap lg:flex-nowrap justify-between items-center gap-3 lg:gap-6 w-full">
                {/* Brand & Title */}
                <div className="flex items-center gap-3 shrink-0">
                    <Link href="/">
                        <div className="flex items-center gap-3 group cursor-pointer">
                            <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-linear-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-black font-black text-lg md:text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                                MS
                            </div>
                            <div>
                                <h1 className="text-lg md:text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                                    {t("brandName")}
                                    <span className="text-[10px] bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-medium">
                                        Pro
                                    </span>
                                </h1>
                                <p className="text-[11px] text-muted-foreground hidden sm:block">
                                    {t("brandDesc")}
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex items-center gap-1 bg-background/70 p-1 md:p-1.5 rounded-2xl border border-border/60 overflow-x-auto max-w-full order-last lg:order-none w-full lg:w-auto justify-center">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <Link key={link.href} href={link.href}>
                                <button
                                    className={`flex items-center gap-1.5 px-3 py-1.5 md:px-3.5 md:py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                        isActive
                                            ? "bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20"
                                            : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{link.label}</span>
                                    {link.badge && (
                                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? "bg-black/20 text-black" : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"}`}>
                                            {link.badge}
                                        </span>
                                    )}
                                </button>
                            </Link>
                        );
                    })}
                </nav>

                {/* Actions (Cart, Switchers & Auth) */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Cart Button with dynamic counter */}
                    <Link href="/cart">
                        <Button variant="outline" className="bg-background border-border text-foreground hover:bg-accent text-xs rounded-xl px-3 py-1.5 h-9 cursor-pointer flex items-center gap-1.5 hover:border-emerald-500/40 transition-all">
                            <ShoppingCart className="h-3.5 w-3.5 text-emerald-500" /> 
                            <span className="hidden sm:inline">{t("cart")}</span>
                            <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-[20px] text-center">
                                {displayCartCount}
                            </span>
                        </Button>
                    </Link>

                    {/* Language Switcher */}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => dispatch(toggleLanguage())}
                        className="bg-background border-border text-foreground hover:bg-accent rounded-xl w-9 h-9 shrink-0 cursor-pointer"
                        title={language === "ar" ? "English" : "العربية"}
                    >
                        <span className="text-xs font-black font-mono">
                            {language === "ar" ? "EN" : "AR"}
                        </span>
                    </Button>

                    {/* Theme Switcher */}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => dispatch(toggleTheme())}
                        className="bg-background border-border text-foreground hover:bg-accent rounded-xl w-9 h-9 shrink-0 cursor-pointer"
                        title={theme === "dark" ? "Light Mode" : "Dark Mode"}
                    >
                        {theme === "dark" ? (
                            <Sun className="h-4 w-4 text-amber-500" />
                        ) : (
                            <Moon className="h-4 w-4 text-indigo-500" />
                        )}
                    </Button>

                    {/* Auth Button */}
                    {isAuth ? (
                        <Button 
                            variant="outline" 
                            onClick={logout} 
                            className="bg-background border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500 text-xs rounded-xl px-3 py-1.5 h-9 flex items-center gap-1.5 shrink-0 cursor-pointer"
                        >
                            <LogOut className="h-3.5 w-3.5" /> 
                            <span>{t("logout")}</span>
                        </Button>
                    ) : (
                        <Link href="/auth/login">
                            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/20 px-3.5 py-1.5 h-9 flex items-center gap-1.5 shrink-0 cursor-pointer">
                                <LogIn className="h-3.5 w-3.5" /> 
                                <span>{t("login")}</span>
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
