'use client';

import { useState } from 'react';
import { getClientApiUrl } from '@/lib/config';
import { Ticket } from '@/interfaces';

export default function DriverPanel({ ticket, onUpdate }: { ticket: Ticket, onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const { apiFetch } = await import('@/lib/api');
      const res = await apiFetch(`/shipping/tickets/${ticket.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        onUpdate();
      } else {
        alert('حدث خطأ أثناء تحديث الحالة');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-emerald-500/30 transition-all group">
      <div className="flex-1 space-y-1">
        <h3 className="font-bold text-lg text-zinc-100">طلب <span className="text-emerald-400">#{ticket.orderId}</span></h3>
        <p className="text-sm text-zinc-400">📍 العنوان: <span className="text-zinc-300">{ticket.shippingAddress}</span></p>
        {ticket.codAmount && (
          <p className="text-sm font-semibold text-emerald-500">💵 المطلوب تحصيله: {ticket.codAmount} LYD</p>
        )}
        <div className="mt-3">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
            ticket.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
            ticket.status === 'OUT_FOR_DELIVERY' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
            'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
          }`}>
            الحالة: {ticket.status}
          </span>
        </div>
      </div>
      
      <div className="flex gap-2 w-full md:w-auto">
        {ticket.status !== 'DELIVERED' && (
          <button 
            onClick={() => updateStatus('DELIVERED')}
            disabled={loading}
            className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            {loading ? 'جاري التحديث...' : '✔️ تم التسليم (COD)'}
          </button>
        )}
      </div>
    </div>
  );
}
