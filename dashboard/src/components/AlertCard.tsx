'use client';

import { SecurityAlert, SEVERITY_LABELS, THREAT_LABELS } from '@/types/alert';
import { Shield, Clock, MapPin, Server, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface AlertCardProps {
  alert: SecurityAlert;
  index: number;
}

export function AlertCard({ alert }: AlertCardProps) {
  // Override severity colors for Cyberpunk feel if necessary, or use the default ones but add glow
  const severityColor = alert.severity === 'critical' ? '#ff003c' : alert.severity === 'high' ? '#ff8c00' : alert.severity === 'medium' ? '#fcee0a' : '#00f0ff';
  const timeAgo = getTimeAgo(alert.timestamp);

  const isCritical = alert.severity === 'critical';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        scale: 1,
        ...(isCritical ? { x: [-2, 2, -2, 0] } : {}) 
      }}
      transition={{ 
        duration: 0.3,
        ...(isCritical ? { x: { repeat: 3, duration: 0.1 } } : {})
      }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`alert-card group`}
      style={{
        borderLeftColor: severityColor,
        boxShadow: isCritical ? `0 0 15px ${severityColor}40` : undefined
      }}
    >
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="severity-badge"
              style={{ 
                backgroundColor: `${severityColor}15`, 
                color: severityColor,
                borderColor: `${severityColor}50`,
                textShadow: `0 0 5px ${severityColor}`
              }}
            >
              {isCritical && <Zap size={10} className="inline mr-1 mb-0.5 animate-pulse" />}
              {SEVERITY_LABELS[alert.severity]}
            </span>
            <span className="threat-badge">
              {THREAT_LABELS[alert.threatType] || alert.threatType}
            </span>
            {alert.mitreTactic && (
              <span className="mitre-badge">
                {alert.mitreTactic}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-orbitron font-bold text-white mb-1 truncate group-hover:text-cyan-300 transition-colors" style={{ textShadow: isCritical ? `0 0 5px ${severityColor}` : 'none' }}>
            {alert.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-cyan-100/60 font-sans mb-3 line-clamp-2 leading-relaxed">
            {alert.description}
          </p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-orbitron text-[#00f0ff]/60 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <MapPin size={10} className="text-[#00f0ff]" />
              {alert.sourceIp} <span className="text-[#ff003c]">→</span> {alert.destinationIp}
            </span>
            {alert.affectedAsset && (
              <span className="flex items-center gap-1.5">
                <Server size={10} className="text-[#00f0ff]" />
                {alert.affectedAsset}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Shield size={10} className="text-[#00f0ff]" />
              {alert.sensorId}
            </span>
            <span className="flex items-center gap-1.5 ml-auto text-gray-400">
              <Clock size={10} />
              {timeAgo}
            </span>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="flex flex-col items-center justify-center pt-1">
          <div
            className="confidence-ring relative"
            style={{
              background: `conic-gradient(${severityColor} ${alert.confidenceScore * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
              boxShadow: `0 0 10px ${severityColor}30`
            }}
          >
            <span className="text-xs font-orbitron font-bold text-white" style={{ textShadow: `0 0 5px ${severityColor}` }}>
              {Math.round(alert.confidenceScore)}
            </span>
          </div>
          <span className="text-[8px] font-orbitron uppercase tracking-widest text-gray-500 mt-2">Certeza</span>
        </div>
      </div>
    </motion.div>
  );
}

function getTimeAgo(timestamp: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(timestamp).getTime()) / 1000,
  );
  if (seconds < 5) return 'ahora';
  if (seconds < 60) return `hace ${seconds}s`;
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)}m`;
  return `hace ${Math.floor(seconds / 3600)}h`;
}
