import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

export enum ThreatType {
  PHISHING = 'phishing',
  PORT_SCAN = 'port_scan',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DDOS = 'ddos',
  MALWARE = 'malware',
  BRUTE_FORCE = 'brute_force',
  SQL_INJECTION = 'sql_injection',
  XSS = 'xss',
  DATA_EXFILTRATION = 'data_exfiltration',
  RANSOMWARE = 'ransomware',
}

export enum SeverityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AlertStatus {
  NEW = 'new',
  ACKNOWLEDGED = 'acknowledged',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive',
}

export enum SensorType {
  NETWORK_IDS = 'network_ids',
  HOST_IDS = 'host_ids',
  FIREWALL = 'firewall',
  WAF = 'waf',
  ENDPOINT = 'endpoint',
  EMAIL_GATEWAY = 'email_gateway',
}

export class IngestAlertDto {
  @IsString()
  alert_id!: string;

  @IsEnum(ThreatType)
  threat_type!: ThreatType;

  @IsEnum(SeverityLevel)
  severity!: SeverityLevel;

  @IsEnum(AlertStatus)
  @IsOptional()
  status?: AlertStatus;

  @IsEnum(SensorType)
  sensor_type!: SensorType;

  @IsString()
  sensor_id!: string;

  @IsString()
  source_ip!: string;

  @IsString()
  destination_ip!: string;

  @IsNumber()
  @IsOptional()
  source_port?: number;

  @IsNumber()
  @IsOptional()
  destination_port?: number;

  @IsString()
  @IsOptional()
  protocol?: string;

  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsString()
  @IsOptional()
  raw_log?: string;

  @IsString()
  @IsOptional()
  affected_asset?: string;

  @IsString()
  @IsOptional()
  mitre_tactic?: string;

  @IsString()
  @IsOptional()
  mitre_technique?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  confidence_score?: number;

  @IsDateString()
  @IsOptional()
  timestamp?: string;
}

export class UpdateAlertStatusDto {
  @IsEnum(AlertStatus)
  status!: AlertStatus;
}

export class AlertQueryDto {
  @IsOptional()
  @IsEnum(ThreatType)
  threatType?: ThreatType;

  @IsOptional()
  @IsEnum(SeverityLevel)
  severity?: SeverityLevel;

  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
}
