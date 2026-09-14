'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  DollarSign, Home as HomeIcon, LayoutDashboard, LogIn, LogOut, Moon, PackageSearch,
  Settings, Shield, ShoppingBag, ShoppingCart, Sun, UserRound, Users, Warehouse
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserIdentity, isAuthenticated, logout } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import { RootState } from '@/store/store';
import { toggleLanguage, toggleTheme } from '@/store/slices/uiSlice';
import { useTranslation } from '@/lib/translations';
import { CART_CHANGED_EVENT, CartChangedDetail } from '@/lib/cart-events';

export function Header() {
  const [isAuth, setIsAuth] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [serverCartCount, setServerCartCount] = useState<number | null>(null);
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { t, language, theme } = useTranslation();
  const reduxCartItems = useSelector((state: RootState) => state.cart?.items || []);
  const localCartCount = reduxCartItems.reduce((total, item) => total + (item.quantity || 1), 0);

  const refreshCartCount = useCallback(async () => {
    if (!isAuthenticated()) {
      setServerCartCount(0);
      return;
    }
    try {
      const res = await apiFetch('/cart');
      if (!res.ok) return;
      const data = await res.json();
      if (data?.items) {
        setServerCartCount(data.items.reduce((sum: number, item: any) => sum + Number(item.quantity || 1), 0));
      }
    } catch {
      // Keep the optimistic badge value if the cart service is temporarily unavailable.
    }
  }, []);

  useEffect(() => {
    const authenticated = isAuthenticated();
    const identity = getUserIdentity();
    setIsAuth(authenticated);
    setRole(identity?.role ? String(identity.role).toLowerCase() : null);
    setUserName(identity?.name || '');
    setUserEmail(identity?.email || '');
    refreshCartCount();
  }, [pathname, refreshCartCount]);

  useEffect(() => {
    const handleCartChanged = (event: Event) => {
      const detail = (event as CustomEvent<CartChangedDetail>).detail || {};
      if (typeof detail.count === 'number') {
        setServerCartCount(Math.max(0, detail.count));
      } else if (typeof detail.delta === 'number') {
        setServerCartCount((current) => Math.max(0, (current ?? localCartCount) + detail.delta!));
      }
      // Reconcile the optimistic badge with the authoritative server cart.
      void refreshCartCount();
    };

    window.addEventListener(CART_CHANGED_EVENT, handleCartChanged);
    return () => window.removeEventListener(CART_CHANGED_EVENT, handleCartChanged);
  }, [localCartCount, refreshCartCount]);

  const navLinks = useMemo(() => {
    const links: any[] = [{ href: '/', label: t('navHome'), icon: HomeIcon }];
    if (role === 'admin') {
      links.push(
        { href: '/admin/dashboard', label: 'لوحة الإدارة', icon: LayoutDashboard },
        { href: '/admin/products', label: 'المنتجات', icon: PackageSearch },
        { href: '/admin/users', label: 'المستخدمون', icon: Users },
        { href: '/admin/orders', label: 'الطلبات', icon: ShoppingBag },
        { href: '/admin/permissions', label: 'الصلاحيات', icon: Shield },
        { href: '/admin/logistics', label: 'اللوجستيات', icon: Warehouse },
        { href: '/admin/finance', label: 'المالية', icon: DollarSign },
        { href: '/admin/settings', label: 'الإعدادات', icon: Settings },
      );
    }
    return links;
  }, [role, t]);

  const displayCartCount = serverCartCount ?? localCartCount;

  return (
    <header className="fixed inset-x-0 top-0 z-[100] border-b border-border/70 bg-background/90 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
        <div className="h-[4.6rem] flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 min-w-0 shrink-0">
            <img src="/microstore-logo.svg" alt="MicroStore" className="w-11 h-11 rounded-2xl shadow-lg shadow-emerald-500/20" />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-black tracking-tight truncate">MicroStore <span className="text-[10px] align-middle bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full">v3.1</span></h1>
              <p className="text-[11px] text-muted-foreground hidden md:block">منصة تجارة إلكترونية وإدارة طلبات متعددة الخدمات</p>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isAuth && (
              <div className="hidden sm:flex items-center gap-2 rounded-xl border border-border bg-card/70 px-3 h-9 max-w-[190px]" title={userEmail}>
                <UserRound className="w-4 h-4 text-emerald-500 shrink-0" />
                <div className="min-w-0 leading-tight">
                  <div className="text-xs font-extrabold truncate">{userName || 'مستخدم'}</div>
                  <div className="text-[9px] text-muted-foreground truncate">{role === 'admin' ? 'مدير النظام' : 'مستخدم'}</div>
                </div>
              </div>
            )}

            <Link href="/cart" aria-label="السلة">
              <Button variant="outline" className="rounded-xl h-9 px-2.5 sm:px-3 gap-1.5">
                <ShoppingCart className="w-4 h-4 text-emerald-500"/>
                <span className="hidden md:inline">السلة</span>
                <span className="min-w-5 px-1 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-black">{displayCartCount}</span>
              </Button>
            </Link>

            <Button variant="outline" size="icon" onClick={() => dispatch(toggleLanguage())} className="rounded-xl w-9 h-9" title={language === 'ar' ? 'English' : 'العربية'}>
              <span className="text-xs font-black">{language === 'ar' ? 'EN' : 'AR'}</span>
            </Button>

            <Button variant="outline" size="icon" onClick={() => dispatch(toggleTheme())} className="rounded-xl w-9 h-9" aria-label="تبديل المظهر" title={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}>
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500"/> : <Moon className="w-4 h-4 text-indigo-500"/>}
            </Button>

            {isAuth ? (
              <Button variant="outline" onClick={logout} className="rounded-xl h-9 px-2.5 sm:px-3 text-rose-500 border-rose-500/25 hover:bg-rose-500/10">
                <LogOut className="w-4 h-4 sm:ml-1"/><span className="hidden sm:inline">خروج</span>
              </Button>
            ) : (
              <Link href="/auth/login">
                <Button className="rounded-xl h-9 px-3 bg-emerald-600 hover:bg-emerald-500 text-white"><LogIn className="w-4 h-4 sm:ml-1"/><span className="hidden sm:inline">دخول</span></Button>
              </Link>
            )}
          </div>
        </div>

        <nav className="h-[3.15rem] flex items-center gap-1 overflow-x-auto border-t border-border/50 scrollbar-none" aria-label="التنقل الرئيسي">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${active ? 'bg-emerald-500 text-black shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-accent/70'}`}>
                <Icon className="w-3.5 h-3.5" />{link.label}
              </Link>
            );
          })}
          {isAuth && userName && (
            <div className="sm:hidden ms-auto flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground px-2">
              <UserRound className="w-3.5 h-3.5 text-emerald-500"/><span className="max-w-24 truncate">{userName}</span>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
