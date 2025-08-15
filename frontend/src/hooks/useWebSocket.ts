import { useEffect, useRef, useState } from 'react';

interface ProgressMessage {
    type: 'progress_update';
    data: any;
}

export const useWebSocket = () => {
    const [progress, setProgress] = useState<any>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<number | null>(null);
    const isConnectingRef = useRef<boolean>(false);

    const cleanup = () => {
        if (reconnectTimeoutRef.current) {
            window.clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        isConnectingRef.current = false;
    };

    const connect = () => {
        if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        cleanup();
        isConnectingRef.current = true;

        try {
            wsRef.current = new WebSocket('ws://localhost:3000/ws');

            wsRef.current.onopen = () => {
                isConnectingRef.current = false;
                console.log('WebSocket connected');
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data) as ProgressMessage;
                    if (message.type === 'progress_update') {
                        setProgress(message.data);
                    }
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            wsRef.current.onclose = (event) => {
                if (!event.wasClean) {
                    console.log('WebSocket connection lost, attempting to reconnect...');
                    reconnectTimeoutRef.current = window.setTimeout(connect, 3000);
                }
                isConnectingRef.current = false;
            };

            // ping/pong 메시지 처리
            const pingInterval = setInterval(() => {
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    wsRef.current.send('ping');
                }
            }, 30000);

            // cleanup 함수에 pingInterval 정리 로직 추가
            return () => {
                clearInterval(pingInterval);
            };

        } catch (error) {
            console.error('Failed to establish WebSocket connection:', error);
            isConnectingRef.current = false;
        }
    };

    useEffect(() => {
        const cleanupFn = connect();

        return () => {
            cleanup();
            cleanupFn?.();
        };
    }, []);

    return progress;
};
