import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/store/Providers";
import { NotificationListener } from "@/components/NotificationListener";
import { ToastProvider } from "@/components/ui/use-toast";
import { AppShell } from "@/components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Microservices Shop",
  description: "A premium shopping experience built with Microservices",
};

const themeBootScript = `
(function(){try{var saved=localStorage.getItem('theme');var mode=(saved==='light'||saved==='dark')?saved:(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.setAttribute('data-mode',mode);document.documentElement.classList.toggle('dark',mode==='dark');document.documentElement.classList.toggle('light',mode==='light');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <Providers>
          <ToastProvider>
            <AppShell>{children}</AppShell>
            <NotificationListener />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
