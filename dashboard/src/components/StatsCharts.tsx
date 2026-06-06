'use client';

import { SecurityAlert, SeverityLevel, SEVERITY_LABELS, THREAT_LABELS, ThreatType } from '@/types/alert';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area, CartesianGrid,
} from 'recharts';
import { Shield, AlertTriangle, Activity, Skull } from 'lucide-react';
import { useMemo } from 'react';

interface StatsChartsProps {
  alerts: SecurityAlert[];
}

// ─── Colores del tema Cyberpunk ───
const CHART_COLORS = ['#00f0ff', '#ff00ff', '#fcee0a', '#ff003c', '#00ff00', '#ff8c00', '#8b5cf6', '#06b6d4'];

export function StatsCharts({ alerts }: StatsChartsProps) {
  // ── Datos calculados ──
  const severityData = useMemo(() => {
    const counts: Record<SeverityLevel, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    alerts.forEach((a) => counts[a.severity]++);
    return Object.entries(counts).map(([key, value]) => ({
      name: SEVERITY_LABELS[key as SeverityLevel],
      value,
      color: key === 'critical' ? '#ff003c' : key === 'high' ? '#ff8c00' : key === 'medium' ? '#fcee0a' : '#00f0ff',
    }));
  }, [alerts]);

  const threatData = useMemo(() => {
    const counts: Record<string, number> = {};
    alerts.forEach((a) => {
      counts[a.threatType] = (counts[a.threatType] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([type, count], i) => ({
        name: THREAT_LABELS[type as ThreatType] || type,
        count,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }));
  }, [alerts]);

  const timelineData = useMemo(() => {
    const buckets: Record<string, number> = {};
    alerts.forEach((a) => {
      const d = new Date(a.timestamp);
      const key = `${d.getHours().toString().padStart(2, '0')}:${(Math.floor(d.getMinutes() / 5) * 5).toString().padStart(2, '0')}`;
      buckets[key] = (buckets[key] || 0) + 1;
    });
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([time, count]) => ({ time, count }));
  }, [alerts]);

  const riskLevel = useMemo(() => {
    if (alerts.length === 0) return 0;
    const weights = { critical: 40, high: 25, medium: 10, low: 2 };
    const total = alerts.reduce((sum, a) => sum + (weights[a.severity] || 0), 0);
    return Math.min(100, Math.round((total / alerts.length) * 4));
  }, [alerts]);

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const highCount = alerts.filter((a) => a.severity === 'high').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* ── KPI Cards ── */}
      <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          icon={<Activity size={24} />}
          label="EVENTOS DETECTADOS"
          value={alerts.length}
          color="#00f0ff"
        />
        <KPICard
          icon={<Skull size={24} />}
          label="AMENAZAS CRÍTICAS"
          value={criticalCount}
          color="#ff003c"
          pulse={criticalCount > 0}
        />
        <KPICard
          icon={<AlertTriangle size={24} />}
          label="ADVERTENCIAS ALTAS"
          value={highCount}
          color="#ff8c00"
        />
        <KPICard
          icon={<Shield size={24} />}
          label="NIVEL DE RIESGO"
          value={`${riskLevel}%`}
          color={riskLevel > 70 ? '#ff003c' : riskLevel > 40 ? '#fcee0a' : '#00f0ff'}
          isRisk
          riskLevel={riskLevel}
        />
      </div>

      {/* ── Top Amenazas (Bar) ── */}
      <div className="glass-panel p-5 border border-[#00f0ff]/20">
        <h3 className="text-sm font-orbitron font-bold text-[#00f0ff] mb-4 uppercase tracking-widest text-shadow-neon">Top Amenazas (Vectores)</h3>
        {threatData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={threatData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fill: '#a5f3fc', fontSize: 10, fontFamily: 'var(--font-orbitron)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(5, 5, 15, 0.9)',
                  border: '1px solid #00f0ff',
                  borderRadius: '4px',
                  color: '#fff',
                  fontFamily: 'var(--font-sans)',
                  boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)'
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
                {threatData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} style={{ filter: `drop-shadow(0 0 5px ${entry.color})` }} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
      </div>

      {/* ── Severidad (Pie) ── */}
      <div className="glass-panel p-5 border border-[#ff00ff]/20">
        <h3 className="text-sm font-orbitron font-bold text-[#ff00ff] mb-4 uppercase tracking-widest text-shadow-neon">Análisis de Severidad</h3>
        {alerts.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={severityData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                strokeWidth={0}
              >
                {severityData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} style={{ filter: `drop-shadow(0 0 8px ${entry.color})` }} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(5, 5, 15, 0.9)',
                  border: '1px solid #ff00ff',
                  borderRadius: '4px',
                  color: '#fff',
                  fontFamily: 'var(--font-sans)',
                  boxShadow: '0 0 10px rgba(255, 0, 255, 0.2)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
        {/* Legend */}
        <div className="flex justify-center flex-wrap gap-4 mt-2">
          {severityData.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color, boxShadow: `0 0 5px ${s.color}` }} />
              <span className="text-[10px] font-orbitron text-gray-300 uppercase tracking-widest">
                {s.name} ({s.value})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Timeline (Area) ── */}
      <div className="lg:col-span-2 glass-panel p-5 border border-[#00f0ff]/20">
        <h3 className="text-sm font-orbitron font-bold text-[#00f0ff] mb-4 uppercase tracking-widest text-shadow-neon">Frecuencia Cuántica de Ataques</h3>
        {timelineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" stroke="rgba(0,240,255,0.1)" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fill: '#00f0ff', fontSize: 10, fontFamily: 'var(--font-orbitron)' }}
                axisLine={{ stroke: 'rgba(0,240,255,0.2)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#00f0ff', fontSize: 10, fontFamily: 'var(--font-orbitron)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(5, 5, 15, 0.9)',
                  border: '1px solid #00f0ff',
                  borderRadius: '4px',
                  color: '#fff',
                  fontFamily: 'var(--font-sans)',
                  boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)'
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#00f0ff"
                strokeWidth={3}
                fill="url(#areaGradient)"
                style={{ filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.5))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
      </div>
    </div>
  );
}

// ── Sub-componentes ──

function KPICard({
  icon,
  label,
  value,
  color,
  isRisk,
  riskLevel,
  pulse
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  isRisk?: boolean;
  riskLevel?: number;
  pulse?: boolean;
}) {
  return (
    <div 
      className={`glass-panel p-5 flex flex-col gap-3 relative overflow-hidden group border border-[${color}]/20`}
      style={{ borderColor: `${color}40`, boxShadow: `0 4px 20px rgba(0,0,0,0.5), inset 0 0 20px ${color}10` }}
    >
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: color }} />
      
      <div className="flex items-center gap-2 relative z-10">
        <span style={{ color, filter: `drop-shadow(0 0 5px ${color})` }} className={pulse ? 'animate-pulse' : ''}>{icon}</span>
        <span className="text-[10px] font-orbitron text-gray-400 tracking-widest">{label}</span>
      </div>
      <span className="text-3xl font-orbitron font-bold text-white relative z-10" style={{ textShadow: `0 0 10px ${color}80` }}>{value}</span>
      
      {isRisk && riskLevel !== undefined && (
        <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden relative z-10 mt-1">
          <div
            className="h-full rounded-full transition-all duration-500 relative"
            style={{
              width: `${riskLevel}%`,
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}`
            }}
          >
            <div className="absolute inset-0 bg-white/50 w-full h-full animate-[pulse_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-[#00f0ff]/30 font-orbitron text-xs tracking-widest">
      <Activity className="mb-2 opacity-50 animate-pulse" size={24} />
      ESPERANDO DATOS TELEMÉTRICOS
    </div>
  );
}
