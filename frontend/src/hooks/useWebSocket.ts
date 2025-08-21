import {useEffect, useRef, useState} from 'react';

interface ProgressMessage {
    data: any;
    timestamp: string;
}

export const useWebSocket = () => {
    const [progress, setProgress] = useState<any>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<number | null>(null);

    const cleanup = () => {
        if (reconnectTimeoutRef.current) {
            window.clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    };

    const connect = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        try {
            wsRef.current = new WebSocket('ws://localhost:3000');

            wsRef.current.onopen = () => {
                console.log('WebSocket 연결됨');
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data) as ProgressMessage;
                    console.log('WebSocket 메시지 수신:', message);
                    setProgress(message.data);
                } catch (error) {
                    console.error('WebSocket 메시지 파싱 실패:', error);
                }
            };

            wsRef.current.onclose = () => {
                console.log('WebSocket disconnected, attempting to reconnect...');
                reconnectTimeoutRef.current = window.setTimeout(connect, 3000);
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket 에러:', error);
            };

        } catch (error) {
            console.error('Failed to establish WebSocket connection:', error);
        }
    };

    useEffect(() => {
        connect();
        return cleanup;
    }, []);

    return {progress, isConnected: wsRef.current?.readyState === WebSocket.OPEN};
};
