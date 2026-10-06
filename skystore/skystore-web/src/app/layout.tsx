import "@/styles/globals.css";
import React from "react";
import { ApolloProviderWrapper } from "@/components/ApolloProviderWrapper";
import { SessionProvider } from "next-auth/react";

export const metadata = {
  title: "SkyStore Enterprise Web",
  description: "Next.js Polyglot High-Performance Architecture",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        <SessionProvider>
          <ApolloProviderWrapper>{children}</ApolloProviderWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}
