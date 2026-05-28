export declare enum ThreatType {
    PHISHING = "phishing",
    PORT_SCAN = "port_scan",
    UNAUTHORIZED_ACCESS = "unauthorized_access",
    DDOS = "ddos",
    MALWARE = "malware",
    BRUTE_FORCE = "brute_force",
    SQL_INJECTION = "sql_injection",
    XSS = "xss",
    DATA_EXFILTRATION = "data_exfiltration",
    RANSOMWARE = "ransomware"
}
export declare enum SeverityLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum AlertStatus {
    NEW = "new",
    ACKNOWLEDGED = "acknowledged",
    INVESTIGATING = "investigating",
    RESOLVED = "resolved",
    FALSE_POSITIVE = "false_positive"
}
export declare enum SensorType {
    NETWORK_IDS = "network_ids",
    HOST_IDS = "host_ids",
    FIREWALL = "firewall",
    WAF = "waf",
    ENDPOINT = "endpoint",
    EMAIL_GATEWAY = "email_gateway"
}
export declare class IngestAlertDto {
    alert_id: string;
    threat_type: ThreatType;
    severity: SeverityLevel;
    status?: AlertStatus;
    sensor_type: SensorType;
    sensor_id: string;
    source_ip: string;
    destination_ip: string;
    source_port?: number;
    destination_port?: number;
    protocol?: string;
    title: string;
    description: string;
    raw_log?: string;
    affected_asset?: string;
    mitre_tactic?: string;
    mitre_technique?: string;
    confidence_score?: number;
    timestamp?: string;
}
export declare class UpdateAlertStatusDto {
    status: AlertStatus;
}
export declare class AlertQueryDto {
    threatType?: ThreatType;
    severity?: SeverityLevel;
    status?: AlertStatus;
    limit?: number;
    offset?: number;
}
