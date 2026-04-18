"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useToast } from "./ui/use-toast";

export function NotificationListener() {
    const { toast } = useToast();
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Connect to the unified domain. /socket.io path is handled by Ingress.
        const newSocket = io({
            path: "/socket.io",
            transports: ["websocket"],
        });

        newSocket.on("connect", () => {
            console.log("[Socket] Connected to Notifications Gateway");
        });

        newSocket.on("order_notification", (data) => {
            console.log("[Socket] Received Notification:", data);
            toast({
                title: "تحديث الطلب 🔔",
                description: data.message,
                duration: 5000,
            });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [toast]);

    return null; // This component just listens
}
