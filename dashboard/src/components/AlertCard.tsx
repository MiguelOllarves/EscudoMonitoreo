'use client';

import { SecurityAlert, SEVERITY_COLORS, SEVERITY_LABELS, THREAT_LABELS } from '@/types/alert';
import { Shield, Clock, MapPin, Server } from 'lucide-react';

interface AlertCardProps {
  alert: SecurityAlert;
  index: number;
}

export function AlertCard({ alert, index }: AlertCardProps) {
  const severityColor = SEVERITY_COLORS[alert.severity];
  const timeAgo = getTimeAgo(alert.timestamp);

  return (
    <div
      className={`alert-card animate-slide-in`}
      style={{
        animationDelay: `${index * 50}ms`,
        borderLeftColor: severityColor,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className="severity-badge"
              style={{ backgroundColor: `${severityColor}20`, color: severityColor }}
            >
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
          <h3 className="text-sm font-semibold text-gray-100 mb-1 truncate">
            {alert.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-400 mb-2 line-clamp-2">
            {alert.description}
          </p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {alert.sourceIp} → {alert.destinationIp}
            </span>
            {alert.affectedAsset && (
              <span className="flex items-center gap-1">
                <Server size={12} />
                {alert.affectedAsset}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Shield size={12} />
              {alert.sensorId}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {timeAgo}
            </span>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="flex flex-col items-center">
          <div
            className="confidence-ring"
            style={{
              background: `conic-gradient(${severityColor} ${alert.confidenceScore * 3.6}deg, #1f2937 0deg)`,
            }}
          >
            <span className="text-xs font-bold text-white">
              {Math.round(alert.confidenceScore)}%
            </span>
          </div>
          <span className="text-[10px] text-gray-500 mt-1">Confianza</span>
        </div>
      </div>
    </div>
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
