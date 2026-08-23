import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { getWsUrl } from '../lib/config';

export const useNotifications = (onStatusChange?: (data: any) => void) => {
    useEffect(() => {
        const socket = io(getWsUrl(), {
            path: "/socket.io/",
            transports: ["websocket"],
            upgrade: false,
            reconnectionAttempts: 5,
            reconnectionDelay: 5000,
            timeout: 10000,
        });

        socket.on('connect', () => {
            console.log('🟢 WebSocket connected successfully to API Gateway');
        });

        socket.on('connect_error', (err) => {
            console.warn('⚠️ Retrying WebSocket connection in 5s...');
        });

        if (onStatusChange) {
            socket.on('orderStatusChanged', (data) => {
                onStatusChange(data);
            });
        }

        socket.on('cashSettled', (data) => {
            console.log('Finance Update:', data.message);
        });

        return () => {
            socket.disconnect();
        };
    }, [onStatusChange]);
};
