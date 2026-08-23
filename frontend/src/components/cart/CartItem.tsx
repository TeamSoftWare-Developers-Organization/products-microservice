'use client';

import React from 'react';

interface CartItemProps {
  item: {
    productId: string | number;
    name_ar?: string;
    quantity: number;
    price: number;
  };
  onUpdateQuantity?: (productId: string | number, quantity: number) => void;
  onRemove?: (productId: string | number) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="p-5 bg-zinc-900/40 backdrop-blur-md rounded-2xl flex justify-between items-center border border-zinc-800/60 hover:border-emerald-500/30 transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-zinc-800/80 rounded-xl overflow-hidden flex items-center justify-center border border-zinc-700/40">
          <span className="text-2xl">📦</span>
        </div>
        <div>
          <h3 className="font-semibold text-lg text-zinc-100 group-hover:text-emerald-400 transition-colors">
            {item.name_ar || `منتج ${item.productId}`}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-sm text-zinc-400">
            <span>الكمية:</span>
            {onUpdateQuantity ? (
              <div className="flex items-center gap-2 bg-zinc-800/80 rounded-lg border border-zinc-700/50 px-2 py-0.5">
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                  className="px-1.5 hover:text-emerald-400 font-bold transition-colors"
                >
                  -
                </button>
                <span className="font-semibold text-zinc-200 px-1">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                  className="px-1.5 hover:text-emerald-400 font-bold transition-colors"
                >
                  +
                </button>
              </div>
            ) : (
              <span className="text-zinc-200 font-semibold">{item.quantity}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="text-right">
          <span className="block font-bold text-xl text-emerald-400">{item.price * item.quantity} LYD</span>
          <span className="text-xs text-zinc-500">{item.price} LYD / وحدة</span>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(item.productId)}
            className="text-xs text-red-400/70 hover:text-red-400 transition-colors flex items-center gap-1 mt-1"
          >
            <span>🗑️ حذف</span>
          </button>
        )}
      </div>
    </div>
  );
}
