'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SecurityAlert } from '@/types/alert';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/context/AuthContext'; // <--- IMPORTANTE: Importar el contexto de autenticación

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://escudomonitoreo.onrender.com';
const MAX_ALERTS = 100;

export function useAlertSocket() {
  const { token } = useAuth(); // Ahora sí existe y tiene valor
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
          // Aseguramos que data.alerts exista incluso si es vacío
          setAlerts(data.alerts || []);
        }
      } catch (err) {
        console.error('Error fetching initial alerts:', err);
      }
    }
    fetchInitialAlerts();

    // 2. Conectar WebSocket para recibir nuevas alertas
    // Pasamos el token en la propiedad 'auth' para que el servidor lo valide
    const socket = io(`${BACKEND_URL}`, {
      path: '/socket.io', // Ajusta esto si tu backend usa un path diferente
      transports: ['websocket'],
      reconnection: true,
      auth: { 
        token: token 
      },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Conectado al WebSocket exitosamente');
      setConnected(true);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Error de conexión al WebSocket:', err.message);
      setConnected(false);
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
  }, [token]); // El efecto se vuelve a ejecutar si el token cambia

  const clearAlerts = useCallback(() => setAlerts([]), []);

  return { alerts, connected, clearAlerts };
}
