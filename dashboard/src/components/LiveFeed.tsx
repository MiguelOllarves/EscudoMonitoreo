'use client';

import { SecurityAlert } from '@/types/alert';
import { AlertCard } from './AlertCard';
import { Radio, Trash2 } from 'lucide-react';

interface LiveFeedProps {
  alerts: SecurityAlert[];
  connected: boolean;
  onClear: () => void;
}

export function LiveFeed({ alerts, connected, onClear }: LiveFeedProps) {
  return (
    <div className="glass-panel flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white">Feed en Vivo</h2>
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                connected ? 'bg-green-400 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-gray-400">
              {connected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          {connected && (
            <Radio size={14} className="text-green-400 animate-pulse" />
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {alerts.length} alertas
          </span>
          <button
            onClick={onClear}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-200 transition-colors"
            title="Limpiar feed"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Radio size={48} className="mb-4 opacity-30" />
            <p className="text-sm">Esperando alertas...</p>
            <p className="text-xs mt-1">
              {connected
                ? 'Conectado al backend. Inicia la simulación.'
                : 'Conectando al WebSocket...'}
            </p>
          </div>
        ) : (
          alerts.map((alert, i) => (
            <AlertCard key={alert.alertId || i} alert={alert} index={i} />
          ))
        )}
      </div>
    </div>
  );
}
