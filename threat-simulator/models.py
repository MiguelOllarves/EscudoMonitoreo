"""
models.py — Modelos de datos para las alertas de ciberseguridad simuladas.

Cada alerta representa un evento de seguridad detectado por un "sensor virtual".
Estos modelos definen la estructura JSON que consumirá el backend NestJS en la Fase 2.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from typing import Optional
import uuid


# ─────────────────────────────────────────────────────
# ENUMS: Clasificación de amenazas y severidad
# ─────────────────────────────────────────────────────

class ThreatType(str, Enum):
    """Tipos de amenazas que el simulador puede generar."""
    PHISHING = "phishing"
    PORT_SCAN = "port_scan"
    UNAUTHORIZED_ACCESS = "unauthorized_access"
    DDOS = "ddos"
    MALWARE = "malware"
    BRUTE_FORCE = "brute_force"
    SQL_INJECTION = "sql_injection"
    XSS = "xss"
    DATA_EXFILTRATION = "data_exfiltration"
    RANSOMWARE = "ransomware"


class SeverityLevel(str, Enum):
    """Nivel de severidad del evento — sigue el estándar CEF (Common Event Format)."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertStatus(str, Enum):
    """Estado actual de la alerta en el pipeline."""
    NEW = "new"
    ACKNOWLEDGED = "acknowledged"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    FALSE_POSITIVE = "false_positive"


class SensorType(str, Enum):
    """Tipo de sensor que originó la alerta."""
    NETWORK_IDS = "network_ids"        # Como Snort
    HOST_IDS = "host_ids"              # Como OSSEC/Wazuh
    FIREWALL = "firewall"              # Logs de firewall
    WAF = "waf"                        # Web Application Firewall
    ENDPOINT = "endpoint"              # Antivirus / EDR
    EMAIL_GATEWAY = "email_gateway"    # Filtro de correo


# ─────────────────────────────────────────────────────
# MODELO PRINCIPAL: SecurityAlert
# ─────────────────────────────────────────────────────

class SecurityAlert(BaseModel):
    """
    Modelo central de una alerta de seguridad.
    
    Estructura diseñada para ser compatible con formatos estándar
    de SIEM como Elastic SIEM, Splunk y Wazuh.
    """
    # Identificación
    alert_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="Identificador único de la alerta (UUID v4)"
    )
    
    # Clasificación de la amenaza
    threat_type: ThreatType = Field(
        description="Tipo de amenaza detectada"
    )
    severity: SeverityLevel = Field(
        description="Nivel de severidad de la alerta"
    )
    status: AlertStatus = Field(
        default=AlertStatus.NEW,
        description="Estado actual de la alerta"
    )
    
    # Origen del evento
    sensor_type: SensorType = Field(
        description="Tipo de sensor que generó la alerta"
    )
    sensor_id: str = Field(
        description="Identificador del sensor (ej: 'NIDS-001')"
    )
    
    # Información de red
    source_ip: str = Field(
        description="IP de origen del evento"
    )
    destination_ip: str = Field(
        description="IP de destino del evento"
    )
    source_port: Optional[int] = Field(
        default=None,
        description="Puerto de origen"
    )
    destination_port: Optional[int] = Field(
        default=None,
        description="Puerto de destino"
    )
    protocol: str = Field(
        default="TCP",
        description="Protocolo de red (TCP, UDP, ICMP, HTTP)"
    )
    
    # Detalles del evento
    title: str = Field(
        description="Título descriptivo corto de la alerta"
    )
    description: str = Field(
        description="Descripción detallada del evento detectado"
    )
    raw_log: Optional[str] = Field(
        default=None,
        description="Log crudo original del sensor (simulado)"
    )
    
    # Contexto adicional
    affected_asset: Optional[str] = Field(
        default=None,
        description="Activo afectado (servidor, estación de trabajo, etc.)"
    )
    mitre_tactic: Optional[str] = Field(
        default=None,
        description="Táctica MITRE ATT&CK asociada"
    )
    mitre_technique: Optional[str] = Field(
        default=None,
        description="Técnica MITRE ATT&CK asociada"
    )
    confidence_score: float = Field(
        default=0.0,
        ge=0.0,
        le=100.0,
        description="Puntuación de confianza de la detección (0-100)"
    )
    
    # Timestamps
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Momento exacto de la detección"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "alert_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                "threat_type": "port_scan",
                "severity": "medium",
                "status": "new",
                "sensor_type": "network_ids",
                "sensor_id": "NIDS-001",
                "source_ip": "192.168.1.105",
                "destination_ip": "10.0.0.50",
                "source_port": 54321,
                "destination_port": 22,
                "protocol": "TCP",
                "title": "Escaneo de puertos detectado",
                "description": "Se detectaron 150 intentos de conexión SYN a puertos consecutivos desde 192.168.1.105",
                "affected_asset": "SRV-WEB-01",
                "mitre_tactic": "Discovery",
                "mitre_technique": "T1046 - Network Service Scanning",
                "confidence_score": 87.5,
                "timestamp": "2026-04-24T20:00:00Z"
            }
        }


# ─────────────────────────────────────────────────────
# MODELOS DE RESPUESTA API
# ─────────────────────────────────────────────────────

class SimulatorStatus(BaseModel):
    """Estado actual del simulador."""
    is_running: bool
    alerts_generated: int
    alerts_forwarded: int
    uptime_seconds: float
    forward_mode: str
    alert_interval: float


class SimulatorConfig(BaseModel):
    """Configuración modificable del simulador en runtime."""
    alert_interval: Optional[float] = Field(
        default=None,
        ge=0.5,
        le=60.0,
        description="Intervalo entre alertas en segundos"
    )
    forward_mode: Optional[str] = Field(
        default=None,
        description="Modo: 'local' o 'forward'"
    )
