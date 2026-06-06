'use client';

import { useEffect, useRef } from 'react';
import { SecurityAlert } from '@/types/alert';
import { AlertCard } from './AlertCard';
import { Radio, Trash2, Activity } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSimulatorAudio } from '@/hooks/useSimulatorAudio';

interface LiveFeedProps {
  alerts: SecurityAlert[];
  connected: boolean;
  onClear: () => void;
}

export function LiveFeed({ alerts, connected, onClear }: LiveFeedProps) {
  const { playSound } = useSimulatorAudio();
  const prevAlertCount = useRef(alerts.length);

  useEffect(() => {
    if (alerts.length > prevAlertCount.current) {
      // New alert arrived
      const latestAlert = alerts[0];
      if (latestAlert && latestAlert.severity === 'critical') {
        playSound('alertHigh');
      } else {
        playSound('alertLow');
      }
    }
    prevAlertCount.current = alerts.length;
  }, [alerts, playSound]);

  return (
    <div className="glass-panel flex flex-col h-full border border-[#00f0ff]/20 shadow-[0_0_20px_rgba(0,240,255,0.05)]">
      {/* Header Cyberpunk */}
      <div className="flex items-center justify-between p-4 border-b border-[#00f0ff]/30 bg-[#00f0ff]/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-50" />
        
        <div className="flex items-center gap-3 relative z-10">
          <Activity className="text-[#00f0ff] animate-pulse" size={20} />
          <h2 className="text-lg font-orbitron font-bold text-white tracking-widest uppercase text-shadow-neon">Feed Táctico</h2>
          <div className="flex items-center gap-2 ml-2">
            <span
              className={`h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] ${
                connected ? 'bg-[#00f0ff] text-[#00f0ff] animate-pulse' : 'bg-[#ff003c] text-[#ff003c]'
              }`}
            />
            <span className="text-[10px] font-orbitron uppercase text-[#00f0ff]/70 tracking-widest">
              {connected ? 'Enlace Activo' : 'Señal Perdida'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
          <span className="text-[10px] font-orbitron text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-1 rounded border border-[#00f0ff]/30">
            {alerts.length} EVENTOS
          </span>
          <button
            onClick={() => {
              playSound('beep');
              onClear();
            }}
            className="p-1.5 rounded bg-transparent border border-[#ff003c]/30 hover:bg-[#ff003c]/20 hover:border-[#ff003c] text-[#ff003c] transition-all"
            title="Purgar registros"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar relative">
        {alerts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-[#00f0ff]/50 font-orbitron"
          >
            <Radio size={48} className="mb-4 opacity-30" />
            <p className="text-sm uppercase tracking-widest text-shadow-neon">Escaneando sector...</p>
            <p className="text-[10px] mt-2 opacity-70">
              {connected
                ? 'Conexión cuántica estable. Simulador activo.'
                : 'Intentando restablecer enlace...'}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {alerts.map((alert, i) => (
              <AlertCard key={alert.alertId || i} alert={alert} index={i} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
