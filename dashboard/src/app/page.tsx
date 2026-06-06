'use client';

import { useAlertSocket } from '@/hooks/useAlertSocket';
import { LiveFeed } from '@/components/LiveFeed';
import { StatsCharts } from '@/components/StatsCharts';
import { Wifi, WifiOff, Terminal } from 'lucide-react';
import { ParticleBackground } from '@/components/ParticleBackground';

import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';

export default function DashboardPage() {
  const { alerts, connected, clearAlerts } = useAlertSocket();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-transparent">
      {/* Animated Background */}
      <ParticleBackground />

      {/* Overlay to darken background slightly for readability */}
      <div className="absolute inset-0 bg-[#05050f]/60 pointer-events-none z-0" />

      {/* ── Header Cyberpunk ── */}
      <header className="sticky top-0 z-50 glass-header px-6 py-4 flex items-center justify-between border-b border-[#00f0ff]/30 shadow-[0_4px_30px_rgba(0,240,255,0.1)]">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-50" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-2.5 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Terminal size={26} className="text-[#00f0ff]" />
          </div>
          <div>
            <h1 className="text-xl font-orbitron font-bold text-white tracking-widest uppercase" style={{ textShadow: '0 0 10px rgba(0,240,255,0.6)' }}>
              Escudo de Monitoreo
            </h1>
            <p className="text-[10px] text-[#00f0ff]/80 font-orbitron uppercase tracking-[0.2em]">
              Centro de Comando Orbital
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-orbitron font-bold tracking-widest border shadow-[0_0_10px_currentColor] ${
            connected
              ? 'bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/40'
              : 'bg-[#ff003c]/10 text-[#ff003c] border-[#ff003c]/40'
          }`}>
            {connected ? <Wifi size={14} className="animate-pulse" /> : <WifiOff size={14} />}
            {connected ? 'ENLACE ESTABLE' : 'DESCONECTADO'}
          </div>

          {user && (
            <div className="flex items-center gap-4 ml-2 pl-5 border-l border-[#00f0ff]/30">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white font-sans">{user.name}</p>
                <p className="text-[10px] text-[#00f0ff] font-orbitron uppercase tracking-widest">{user.role}</p>
              </div>
              <button 
                onClick={logout}
                className="p-2.5 text-gray-400 hover:text-[#ff003c] hover:bg-[#ff003c]/10 border border-transparent hover:border-[#ff003c]/30 rounded-lg transition-all"
                title="Desconectar"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 p-4 md:p-6 grid grid-cols-1 xl:grid-cols-3 gap-6 relative z-10">
        {/* Charts - 2 columnas */}
        <div className="xl:col-span-2 space-y-6">
          <StatsCharts alerts={alerts} />
        </div>

        {/* Live Feed - 1 columna */}
        <div className="xl:col-span-1 h-[calc(100vh-120px)] sticky top-[92px]">
          <LiveFeed
            alerts={alerts}
            connected={connected}
            onClear={clearAlerts}
          />
        </div>
      </main>
    </div>
  );
}
