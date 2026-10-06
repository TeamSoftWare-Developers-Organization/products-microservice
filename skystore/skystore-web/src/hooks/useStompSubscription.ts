"use client";

import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useSession } from "next-auth/react";

export function useStompSubscription<T>(topic: string) {
  const [data, setData] = useState<T | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!topic) return;

    const socket = new SockJS(process.env.NEXT_PUBLIC_WS_ENDPOINT!);
    const token = (session as any)?.accessToken;

    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(topic, (message) => {
          if (message.body) {
            setData(JSON.parse(message.body));
          }
        });
      },
    });

    stompClient.activate();
    return () => {
      stompClient.deactivate();
    };
  }, [topic, session]);

  return data;
}
