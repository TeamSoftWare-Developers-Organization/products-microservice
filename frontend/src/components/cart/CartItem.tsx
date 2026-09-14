'use client';

import { Minus, Plus, Trash2, Package } from 'lucide-react';

interface CartItemProps {
  item: { productId: string | number; name_ar?: string; quantity: number; price: number; imageUrl?: string };
  onUpdateQuantity?: (productId: string | number, quantity: number) => void;
  onRemove?: (productId: string | number) => void;
  busy?: boolean;
}

export default function CartItem({ item, onUpdateQuantity, onRemove, busy }: CartItemProps) {
  return (
    <div className="surface-card p-4 flex items-center gap-4">
      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-secondary/50 border border-border/60 shrink-0 flex items-center justify-center">
        {item.imageUrl ? <img src={item.imageUrl} alt={item.name_ar || 'منتج'} className="w-full h-full object-cover" /> : <Package className="w-7 h-7 text-muted-foreground/50" />}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-base truncate">{item.name_ar || `منتج ${item.productId}`}</h3>
        <p className="text-sm text-muted-foreground mt-1">{Number(item.price).toLocaleString()} د.ل للوحدة</p>
        <div className="mt-3 inline-flex items-center rounded-xl border border-border bg-background/50 overflow-hidden">
          <button disabled={busy || item.quantity <= 1} onClick={() => onUpdateQuantity?.(item.productId, Math.max(1, item.quantity - 1))} className="w-9 h-8 flex items-center justify-center hover:bg-accent disabled:opacity-40"><Minus className="w-3.5 h-3.5" /></button>
          <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
          <button disabled={busy} onClick={() => onUpdateQuantity?.(item.productId, item.quantity + 1)} className="w-9 h-8 flex items-center justify-center hover:bg-accent disabled:opacity-40"><Plus className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <div className="text-left shrink-0">
        <p className="font-black text-emerald-500 text-lg">{(Number(item.price) * item.quantity).toLocaleString()} د.ل</p>
        <button disabled={busy} onClick={() => onRemove?.(item.productId)} className="mt-3 text-xs text-rose-400 hover:text-rose-300 inline-flex items-center gap-1 disabled:opacity-40"><Trash2 className="w-3.5 h-3.5" /> حذف</button>
      </div>
    </div>
  );
}
