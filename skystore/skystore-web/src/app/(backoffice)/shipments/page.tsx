"use client";

import React from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_SHIPMENTS, UPDATE_SHIPMENT_STATUS } from "@/lib/graphql-queries";
import { Shipment, ShipmentStatus } from "@/types";

export default function BackofficeShipments() {
  const { data, loading, refetch } = useQuery(GET_SHIPMENTS);
  const [updateStatus] = useMutation(UPDATE_SHIPMENT_STATUS);

  const handleStatusChange = async (trackingNumber: string, status: ShipmentStatus) => {
    await updateStatus({ variables: { trackingNumber, status } });
    refetch();
  };

  if (loading) return <div className="p-8">جاري تحميل سجلات المستودع...</div>;

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">إدارة شحنات المستودع (Backoffice)</h1>
        <button onClick={() => refetch()} className="bg-slate-100 border p-2 rounded-lg text-sm">
          تحديث البيانات
        </button>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-right border-collapse">
          <thead className="bg-slate-50 border-b text-slate-600 text-sm">
            <tr>
              <th className="p-4">رقم التتبع</th>
              <th className="p-4">الناقل</th>
              <th className="p-4">عنوان التوصيل</th>
              <th className="p-4">الحالة الحالية</th>
              <th className="p-4 text-center">إجراء فوري</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-800 text-sm">
            {data?.shipments?.map((s: Shipment) => (
              <tr key={s.trackingNumber} className="hover:bg-slate-50">
                <td className="p-4 font-mono font-bold">{s.trackingNumber}</td>
                <td className="p-4">{s.carrier}</td>
                <td className="p-4">{s.shippingAddress}</td>
                <td className="p-4">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                    {s.status}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-2">
                  <button
                    onClick={() => handleStatusChange(s.trackingNumber, "DISPATCHED")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs"
                  >
                    شحن (Dispatched)
                  </button>
                  <button
                    onClick={() => handleStatusChange(s.trackingNumber, "DELIVERED")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-xs"
                  >
                    تسليم (Delivered)
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
