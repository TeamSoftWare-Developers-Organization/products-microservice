"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useToast } from "./ui/use-toast";
import { getWsUrl } from "../lib/config";

export function NotificationListener() {
    const { toast } = useToast();
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const newSocket = io(getWsUrl(), {
            path: "/socket.io/",
            transports: ['websocket'],
            upgrade: false,
            autoConnect: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 5000,
            timeout: 10000,
        });

        newSocket.on("connect", () => {
            console.log("🟢 WebSockets Connected Successfully");
        });

        newSocket.on("connect_error", (err) => {
            console.warn("⚠️ WebSockets Server Unreachable, retrying in 5s...");
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

    return null;
}
