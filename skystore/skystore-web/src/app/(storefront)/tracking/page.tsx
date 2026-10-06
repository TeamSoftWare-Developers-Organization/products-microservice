"use client";

import React, { useState } from "react";
import { useStompSubscription } from "@/hooks/useStompSubscription";
import { Shipment, ShipmentStatus } from "@/types";

const steps: ShipmentStatus[] = ["PREPARING", "DISPATCHED", "IN_TRANSIT", "DELIVERED"];

export default function TrackingPage() {
  const [inputCode, setInputCode] = useState("");
  const [activeTrackingNumber, setActiveTrackingNumber] = useState("");

  const liveUpdate = useStompSubscription<Shipment>(
    activeTrackingNumber ? `/topic/shipments/${activeTrackingNumber}` : ""
  );

  const currentStatus: ShipmentStatus = liveUpdate?.status || "PREPARING";

  return (
    <div className="container mx-auto p-6 max-w-2xl" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">تتبع شحنتك لحظياً (Live Tracker)</h1>
      <div className="flex gap-2 mb-8">
        <input
          type="text"
          placeholder="أدخل رقم التتبع (مثال: SKY-B2156287)"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          className="flex-1 border p-2 rounded-lg"
        />
        <button
          onClick={() => setActiveTrackingNumber(inputCode)}
          className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium"
        >
          تتبع
        </button>
      </div>

      {activeTrackingNumber && (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm text-slate-500">رقم الشحنة</p>
              <p className="font-mono font-bold text-lg">{activeTrackingNumber}</p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold">
              مباشر (STOMP Active)
            </span>
          </div>

          <div className="flex justify-between items-center relative my-8">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -z-0 -translate-y-1/2" />
            {steps.map((st, index) => {
              const isPassed = steps.indexOf(currentStatus) >= index;
              return (
                <div key={st} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isPassed ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-xs mt-2 font-medium">{st}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
