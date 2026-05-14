'use client';

import { SecurityAlert, SeverityLevel, SEVERITY_COLORS, SEVERITY_LABELS, THREAT_LABELS, ThreatType } from '@/types/alert';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area, CartesianGrid,
} from 'recharts';
import { Shield, AlertTriangle, Activity, Skull } from 'lucide-react';
import { useMemo } from 'react';

interface StatsChartsProps {
  alerts: SecurityAlert[];
}

// ─── Colores del tema ───
const CHART_COLORS = ['#8b5cf6', '#06b6d4', '#f97316', '#ef4444', '#22c55e', '#eab308', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e'];

export function StatsCharts({ alerts }: StatsChartsProps) {
  // ── Datos calculados ──
  const severityData = useMemo(() => {
    const counts: Record<SeverityLevel, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    alerts.forEach((a) => counts[a.severity]++);
    return Object.entries(counts).map(([key, value]) => ({
      name: SEVERITY_LABELS[key as SeverityLevel],
      value,
      color: SEVERITY_COLORS[key as SeverityLevel],
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
        color: CHART_COLORS[i],
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
      <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          icon={<Activity size={20} />}
          label="Total Alertas"
          value={alerts.length}
          color="#8b5cf6"
        />
        <KPICard
          icon={<Skull size={20} />}
          label="Críticas"
          value={criticalCount}
          color="#ef4444"
        />
        <KPICard
          icon={<AlertTriangle size={20} />}
          label="Altas"
          value={highCount}
          color="#f97316"
        />
        <KPICard
          icon={<Shield size={20} />}
          label="Nivel de Riesgo"
          value={`${riskLevel}%`}
          color={riskLevel > 70 ? '#ef4444' : riskLevel > 40 ? '#eab308' : '#22c55e'}
          isRisk
          riskLevel={riskLevel}
        />
      </div>

      {/* ── Top Amenazas (Bar) ── */}
      <div className="glass-panel p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Top Amenazas</h3>
        {threatData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={threatData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#1e1b4b',
                  border: '1px solid rgba(139,92,246,0.3)',
                  borderRadius: '8px',
                  color: '#e5e7eb',
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
                {threatData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
      </div>

      {/* ── Severidad (Pie) ── */}
      <div className="glass-panel p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Distribución por Severidad</h3>
        {alerts.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={severityData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                strokeWidth={0}
              >
                {severityData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1e1b4b',
                  border: '1px solid rgba(139,92,246,0.3)',
                  borderRadius: '8px',
                  color: '#e5e7eb',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
        {/* Legend */}
        <div className="flex justify-center gap-4 mt-2">
          {severityData.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-gray-400">
                {s.name} ({s.value})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Timeline (Area) ── */}
      <div className="lg:col-span-2 glass-panel p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Timeline de Alertas</h3>
        {timelineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="time"
                tick={{ fill: '#6b7280', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#1e1b4b',
                  border: '1px solid rgba(139,92,246,0.3)',
                  borderRadius: '8px',
                  color: '#e5e7eb',
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#areaGradient)"
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
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  isRisk?: boolean;
  riskLevel?: number;
}) {
  return (
    <div className="glass-panel p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span style={{ color }}>{icon}</span>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <span className="text-2xl font-bold text-white">{value}</span>
      {isRisk && riskLevel !== undefined && (
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${riskLevel}%`,
              backgroundColor: color,
            }}
          />
        </div>
      )}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-[220px] text-gray-600 text-sm">
      Sin datos aún...
    </div>
  );
}
