'use client';

import React from 'react';

interface WarehouseSelectorProps {
  value: number;
  onChange: (id: number) => void;
}

export default function WarehouseSelector({ value, onChange }: WarehouseSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-zinc-400 block font-medium">
        اختر المستودع الأقرب لتوصيل أسرع:
      </label>
      <select 
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full p-3 rounded-xl bg-zinc-900/50 backdrop-blur-md border border-zinc-700/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer"
      >
        <option value={1}>مستودع طرابلس الرئيسي 🏢</option>
        <option value={2}>مستودع بنغازي الفرعي 🏬</option>
      </select>
    </div>
  );
}
