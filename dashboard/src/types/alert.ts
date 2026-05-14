export interface SecurityAlert {
  id: number;
  alertId: string;
  threatType: ThreatType;
  severity: SeverityLevel;
  status: AlertStatus;
  sensorType: SensorType;
  sensorId: string;
  sourceIp: string;
  destinationIp: string;
  sourcePort: number | null;
  destinationPort: number | null;
  protocol: string;
  title: string;
  description: string;
  rawLog: string | null;
  affectedAsset: string | null;
  mitreTactic: string | null;
  mitreTechnique: string | null;
  confidenceScore: number;
  timestamp: string;
  createdAt: string;
}

export type ThreatType =
  | 'phishing'
  | 'port_scan'
  | 'unauthorized_access'
  | 'ddos'
  | 'malware'
  | 'brute_force'
  | 'sql_injection'
  | 'xss'
  | 'data_exfiltration'
  | 'ransomware';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type AlertStatus =
  | 'new'
  | 'acknowledged'
  | 'investigating'
  | 'resolved'
  | 'false_positive';

export type SensorType =
  | 'network_ids'
  | 'host_ids'
  | 'firewall'
  | 'waf'
  | 'endpoint'
  | 'email_gateway';

export interface DashboardStats {
  totalAlerts: number;
  severityBreakdown: Record<SeverityLevel, number>;
  riskLevel: number;
  topThreats: { type: ThreatType; count: number }[];
  topAttackerIps: { ip: string; count: number }[];
  recentAlerts: SecurityAlert[];
  alertsByHour: { hour: string; count: number }[];
}

export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  critical: 'Crítico',
  high: 'Alto',
  medium: 'Medio',
  low: 'Bajo',
};

export const THREAT_LABELS: Record<ThreatType, string> = {
  phishing: 'Phishing',
  port_scan: 'Escaneo de Puertos',
  unauthorized_access: 'Acceso No Autorizado',
  ddos: 'DDoS',
  malware: 'Malware',
  brute_force: 'Fuerza Bruta',
  sql_injection: 'SQL Injection',
  xss: 'XSS',
  data_exfiltration: 'Exfiltración',
  ransomware: 'Ransomware',
};
