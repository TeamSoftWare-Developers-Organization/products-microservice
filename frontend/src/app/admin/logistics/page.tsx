'use client';

import { useState, useEffect } from 'react';
import DriverPanel from '@/components/shipping/DriverPanel';
import { getClientApiUrl } from '@/lib/config';
import { useNotifications } from '@/hooks/useNotifications';
import { Ticket } from '@/interfaces';

export default function LogisticsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { apiFetch } = await import('@/lib/api');
      const res = await apiFetch('/shipping/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useNotifications((data) => {
    // Refresh tickets if new ones are created or updated
    if (data.event === 'ticketCreated' || data.event === 'orderStatusChanged') {
      fetchTickets();
    }
  });

  return (
    <div className="p-8 bg-zinc-950 text-white min-h-screen pt-24">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          🚚 لوحة عمليات الشحن والمناديب
        </h1>

        <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800/60 p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-zinc-200">الشحنات النشطة</h2>
            <button onClick={fetchTickets} className="text-sm px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
              🔄 تحديث
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-zinc-500 animate-pulse">
              جاري جلب بيانات الشحنات... ⏳
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
              لا توجد شحنات حالياً.
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map(ticket => (
                <DriverPanel 
                  key={ticket.id} 
                  ticket={{
                    id: ticket.id,
                    orderId: ticket.orderId,
                    status: ticket.status,
                    shippingAddress: ticket.shippingAddress,
                    codAmount: ticket.codAmount
                  }} 
                  onUpdate={fetchTickets} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
