'use client';

import { useAlertSocket } from '@/hooks/useAlertSocket';
import { LiveFeed } from '@/components/LiveFeed';
import { StatsCharts } from '@/components/StatsCharts';
import { Shield, Wifi, WifiOff } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';

export default function DashboardPage() {
  const { alerts, connected, clearAlerts } = useAlertSocket();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 glass-header px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-600/20 border border-violet-500/30">
            <Shield size={24} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              CyberShield
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              Centro de Monitoreo de Ciberseguridad
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${
            connected
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
            {connected ? 'En línea' : 'Sin conexión'}
          </div>
          {user && (
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-[10px] text-gray-400 uppercase">{user.role}</p>
              </div>
              <button 
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 p-4 md:p-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Charts - 2 columnas */}
        <div className="xl:col-span-2 space-y-4">
          <StatsCharts alerts={alerts} />
        </div>

        {/* Live Feed - 1 columna */}
        <div className="xl:col-span-1 h-[calc(100vh-120px)] sticky top-[76px]">
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
