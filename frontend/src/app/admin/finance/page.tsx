'use client';

import { useState, useEffect } from 'react';
import FinanceRow from '@/components/shipping/FinanceRow';
import { getClientApiUrl } from '@/lib/config';
import { useNotifications } from '@/hooks/useNotifications';
import { CODRecord } from '@/interfaces';

export default function FinancePage() {
  const [tickets, setTickets] = useState<CODRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCodTickets = async () => {
    try {
      setLoading(true);
      const { apiFetch } = await import('@/lib/api');
      const res = await apiFetch('/shipping/tickets');
      if (res.ok) {
        const data = await res.json();
        // Filter out non-COD or unpaid tickets for the finance panel
        // Usually, finance only cares about DELIVERED tickets that had COD.
        const codTickets = data.filter((t: any) => t.codAmount > 0 && t.status === 'DELIVERED');
        setTickets(codTickets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodTickets();
  }, []);

  useNotifications((data) => {
    if (data.event === 'orderStatusChanged' || data.event === 'cashSettled') {
      fetchCodTickets();
    }
  });

  const totalPending = tickets.filter(t => t.codStatus !== 'SETTLED').reduce((acc, t) => acc + Number(t.codAmount), 0);
  const totalSettled = tickets.filter(t => t.codStatus === 'SETTLED').reduce((acc, t) => acc + Number(t.codAmount), 0);

  return (
    <div className="admin-theme p-8 bg-background text-foreground min-h-screen pt-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
          💰 لوحة تحكم المحاسبة وتسوية الكاش
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card/80 p-6 rounded-2xl border border-orange-500/30 flex items-center justify-between">
            <div>
              <h3 className="text-muted-foreground text-sm font-medium">إجمالي الكاش المعلق عند المناديب</h3>
              <p className="text-3xl font-bold text-orange-400 mt-2">{totalPending} LYD</p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
          <div className="bg-card/80 p-6 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
            <div>
              <h3 className="text-muted-foreground text-sm font-medium">إجمالي الكاش المورّد للخزينة</h3>
              <p className="text-3xl font-bold text-emerald-400 mt-2">{totalSettled} LYD</p>
            </div>
            <div className="text-4xl">🏦</div>
          </div>
        </div>

        <div className="bg-card/80 backdrop-blur-md rounded-2xl border border-border p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">سجل التحصيلات المالية (COD)</h2>
            <button onClick={fetchCodTickets} className="text-sm px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
              🔄 تحديث
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground animate-pulse">
              جاري جلب البيانات المالية... ⏳
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card/80 rounded-xl border border-zinc-800 border-dashed">
              لا توجد مبالغ مستحقة للتحصيل.
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map(ticket => (
                <FinanceRow 
                  key={ticket.id} 
                  record={{
                    id: ticket.id,
                    orderId: ticket.orderId,
                    codAmount: ticket.codAmount,
                    codStatus: ticket.codStatus || 'PENDING'
                  }} 
                  onUpdate={fetchCodTickets} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
