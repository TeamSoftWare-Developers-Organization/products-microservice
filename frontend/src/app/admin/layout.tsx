'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { getUserRole, isAuthenticated } from '@/lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      setAllowed(false);
      router.replace('/auth/login');
      return;
    }
    const isAdmin = String(getUserRole() || '').toLowerCase() === 'admin';
    setAllowed(isAdmin);
    if (!isAdmin) router.replace('/');
  }, [router]);

  if (allowed !== true) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="surface-card p-8 text-center"><ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3"/><p className="font-bold">جاري التحقق من صلاحيات الإدارة...</p></div></div>;
  }

  return children;
}
