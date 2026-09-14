'use client';
import Link from 'next/link';
import { Boxes, DollarSign, PackageSearch, Settings, ShieldCheck, ShoppingBag, Truck, Users } from 'lucide-react';
const cards = [
  ['/admin/products','المنتجات','إدارة المنتجات والصور والأسعار والمخزون',PackageSearch],
  ['/admin/users','المستخدمون','الحسابات والأدوار وحالة المستخدمين',Users],
  ['/admin/orders','الطلبات','متابعة الطلبات وحالات التنفيذ',ShoppingBag],
  ['/admin/permissions','الصلاحيات','إدارة RBAC والصلاحيات',ShieldCheck],
  ['/admin/logistics','اللوجستيات','المخازن والشحن والتسليم',Truck],
  ['/admin/finance','المالية','الخزينة والتحصيلات والسجلات',DollarSign],
  ['/admin/settings','الإعدادات','المظهر وإعدادات النظام',Settings],
];
export default function AdminDashboard(){return <main className="max-w-7xl mx-auto px-4 py-8"><div className="hero-panel p-7 mb-7"><div className="flex items-center gap-3"><div className="p-3 rounded-2xl bg-emerald-500/15"><Boxes className="w-7 h-7 text-emerald-500"/></div><div><h1 className="text-2xl sm:text-3xl font-black">لوحة إدارة MicroStore</h1><p className="text-muted-foreground mt-1">وصول مركزي لكل وظائف المتجر والخدمات.</p></div></div></div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{cards.map(([href,title,desc,Icon]:any)=><Link key={href} href={href} className="surface-card p-5 hover:border-emerald-500/40 transition"><div className="flex items-start gap-3"><Icon className="w-6 h-6 text-emerald-500 mt-1"/><div><h2 className="font-black text-lg">{title}</h2><p className="text-sm text-muted-foreground mt-1">{desc}</p></div></div></Link>)}</div></main>}
