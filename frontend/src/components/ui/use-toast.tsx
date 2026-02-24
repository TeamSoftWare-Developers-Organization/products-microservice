"use client";

import { useState, useEffect, createContext, useContext } from "react";

type Toast = {
    id: string;
    title?: string;
    description?: string;
    duration?: number;
};

type ToastContextType = {
    toast: (payload: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = ({ title, description, duration = 3000 }: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, title, description, duration }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-0 right-0 p-4 z-50 flex flex-col gap-2">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className="bg-white border-2 border-primary p-4 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300 min-w-[300px]"
                    >
                        {t.title && <h3 className="font-bold text-primary">{t.title}</h3>}
                        {t.description && <p className="text-gray-600 text-sm">{t.description}</p>}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within a ToastProvider");
    return context;
}

export function Toaster() { return null; } // Placeholder for compatibility
