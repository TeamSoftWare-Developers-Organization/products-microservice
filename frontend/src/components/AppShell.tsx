'use client';

import { Header } from '@/components/Header';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="min-h-screen pt-[8.25rem] sm:pt-[8.5rem] bg-background text-foreground transition-colors duration-300">
        {children}
      </div>
    </>
  );
}
