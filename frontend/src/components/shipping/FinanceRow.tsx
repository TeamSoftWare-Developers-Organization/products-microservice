'use client';

import { useState } from 'react';
import { getClientApiUrl } from '@/lib/config';
import { CODRecord } from '@/interfaces';

export default function FinanceRow({ record, onUpdate }: { record: CODRecord, onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);
  const [amountReceived, setAmountReceived] = useState<number>(record.codAmount);

  const settleCash = async () => {
    setLoading(true);
    try {
      const { apiFetch } = await import('@/lib/api');
      const res = await apiFetch(`/shipping/tickets/${record.id}/collect`, {
        method: 'POST',
        body: JSON.stringify({ 
            driverId: 'admin', 
            amountReceived: Number(amountReceived) 
        })
      });
      if (res.ok) {
        onUpdate();
      } else {
        alert('حدث خطأ أثناء تسوية المبلغ');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center hover:bg-zinc-800/40 hover:border-blue-500/30 transition-all group">
      <div className="flex flex-col md:flex-row md:items-center gap-6 w-full md:w-auto">
        <div className="text-zinc-300">
          <span className="text-xs text-zinc-500 block uppercase tracking-wider mb-1">رقم الطلب</span>
          <span className="font-mono text-lg text-zinc-200">#{record.orderId}</span>
        </div>
        <div className="text-emerald-400 font-bold">
          <span className="text-xs text-zinc-500 block uppercase tracking-wider mb-1">المطلوب (LYD)</span>
          <span className="text-xl">{record.codAmount}</span>
        </div>
        {record.codStatus !== 'SETTLED' && (
          <div>
            <span className="text-xs text-zinc-500 block uppercase tracking-wider mb-1">المستلم الفعلي</span>
            <input 
              type="number" 
              value={amountReceived}
              onChange={(e) => setAmountReceived(Number(e.target.value))}
              className="w-24 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white"
            />
          </div>
        )}
        <div>
          <span className="text-xs text-zinc-500 block uppercase tracking-wider mb-1">الحالة المالية</span>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
            record.codStatus === 'SETTLED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
          }`}>
            {record.codStatus === 'SETTLED' ? '✔️ تمت التسوية بالخزينة' : '⏳ بانتظار التوريد'}
          </span>
        </div>
      </div>
      
      {record.codStatus !== 'SETTLED' && (
        <button 
          onClick={settleCash}
          disabled={loading}
          className="mt-4 md:mt-0 w-full md:w-auto px-6 py-2 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg font-bold transition-all text-sm disabled:opacity-50 shadow-lg shadow-blue-900/20"
        >
          {loading ? 'جاري التسوية...' : '📥 توريد للصندوق'}
        </button>
      )}
    </div>
  );
}
