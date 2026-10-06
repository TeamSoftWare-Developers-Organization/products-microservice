import Link from "next-auth";
import React from "react";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center" dir="rtl">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md w-full shadow-sm">
        <h1 className="text-2xl font-bold text-red-600 mb-2">غير مصرح لك بالدخول</h1>
        <p className="text-slate-600 mb-6 text-sm">
          ليس لديك الصلاحيات المطلوبة (ROLE_ADMIN أو ROLE_WAREHOUSE) للوصول إلى هذه الصفحة.
        </p>
        <a
          href="/"
          className="inline-block bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition"
        >
          العودة للرئيسية
        </a>
      </div>
    </div>
  );
}
