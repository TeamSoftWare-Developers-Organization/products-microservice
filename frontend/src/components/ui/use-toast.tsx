"use client";

import { useState, useEffect, createContext, useContext } from "react";

type Toast = {
    id: string;
    title?: string;
    description?: string;
    duration?: number;
    variant?: "default" | "destructive" | "success";
};

type ToastContextType = {
    toast: (payload: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = ({ title, description, duration = 4000, variant = "default" }: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, title, description, duration, variant }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-4 right-4 p-4 z-50 flex flex-col gap-3 max-w-md w-full sm:w-[380px]">
                {toasts.map((t) => {
                    let bgClass = "bg-card/90 border-border text-foreground";
                    let iconColor = "text-primary";
                    let iconSvg = (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    );

                    if (t.variant === "success") {
                        bgClass = "bg-emerald-950/90 border-emerald-500/30 text-emerald-50";
                        iconColor = "text-emerald-400";
                        iconSvg = (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        );
                    } else if (t.variant === "destructive") {
                        bgClass = "bg-destructive/20 border-red-500/30 text-red-100";
                        iconColor = "text-red-400";
                        iconSvg = (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        );
                    }

                    return (
                        <div
                            key={t.id}
                            className={`flex gap-3 items-start border p-4 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 animate-fade-in ${bgClass}`}
                        >
                            <div className={`flex-shrink-0 mt-0.5 ${iconColor}`}>
                                {iconSvg}
                            </div>
                            <div className="flex-1 space-y-1">
                                {t.title && <h3 className="font-bold text-sm leading-none">{t.title}</h3>}
                                {t.description && <p className="text-xs opacity-90 leading-normal">{t.description}</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within a ToastProvider");
    return context;
}

export function Toaster() { return null; }
