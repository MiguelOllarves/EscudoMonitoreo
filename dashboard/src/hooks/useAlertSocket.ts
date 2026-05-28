'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SecurityAlert } from '@/types/alert';
import { fetchWithAuth } from '@/lib/api';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3003';
const MAX_ALERTS = 100;

export function useAlertSocket() {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 1. Cargar historial inicial usando REST API
    async function fetchInitialAlerts() {
      try {
        const res = await fetchWithAuth('/api/alerts?limit=50');
        if (res.ok) {
          const data = await res.json();
          setAlerts(data.alerts);
        }
      } catch (err) {
        console.error('Error fetching initial alerts:', err);
      }
    }
    fetchInitialAlerts();

    // 2. Conectar WebSocket para recibir nuevas alertas
    const socket = io(`${BACKEND_URL}/alerts`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      auth: { token: token },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Conectado al WebSocket');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Desconectado del WebSocket');
      setConnected(false);
    });

    socket.on('new-alert', (alert: SecurityAlert) => {
      setAlerts((prev) => {
        const updated = [alert, ...prev];
        return updated.slice(0, MAX_ALERTS);
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const clearAlerts = useCallback(() => setAlerts([]), []);

  return { alerts, connected, clearAlerts };
}
