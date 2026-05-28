'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SecurityAlert } from '@/types/alert';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://escudomonitoreo.onrender.com';
const MAX_ALERTS = 100;

export function useAlertSocket() {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Si no hay token, no intentamos conectar
    if (!token) return;

    // 1. Cargar historial inicial usando REST API
    async function fetchInitialAlerts() {
      try {
        const res = await fetchWithAuth('/api/alerts?limit=50');
        if (res.ok) {
          const data = await res.json();
          setAlerts(data.alerts || []);
        }
      } catch (err) {
        console.error('Error al cargar historial:', err);
      }
    }
    fetchInitialAlerts();

    // 2. Conectar WebSocket con autenticación
    // Cambiamos a 'extraHeaders' además de 'auth' para asegurar compatibilidad total
    const socket = io(`${BACKEND_URL}/alerts`, {
      path: '/socket.io',
      transports: ['websocket', 'polling'], // Permitir fallback
      reconnection: true,
      auth: { 
        token: token 
      },
      extraHeaders: {
        Authorization: `Bearer ${token}` 
      }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket conectado');
      setConnected(true);

      socket.emit('join-alerts-room');
    });

    socket.on('new-alert', (alert: SecurityAlert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, MAX_ALERTS));
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket Auth Error:', err.message);
      setConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token]);

  const clearAlerts = useCallback(() => setAlerts([]), []);

  return { alerts, connected, clearAlerts };
}
