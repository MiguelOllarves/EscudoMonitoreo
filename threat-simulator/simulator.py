"""
simulator.py — Motor de generación de alertas de ciberseguridad simuladas.

Genera alertas realistas con IPs, puertos, descripciones y mapeo MITRE ATT&CK.
"""

import random
import uuid
from datetime import datetime
from models import (
    SecurityAlert, ThreatType, SeverityLevel,
    SensorType, AlertStatus
)

# ─────────────────────────────────────────────────────
# DATOS DE SIMULACIÓN
# ─────────────────────────────────────────────────────

INTERNAL_IPS = [
    "10.0.0.10", "10.0.0.25", "10.0.0.50", "10.0.0.100",
    "192.168.1.10", "192.168.1.50", "192.168.1.100",
    "172.16.0.5", "172.16.0.20", "172.16.0.55",
]

EXTERNAL_IPS = [
    "45.33.32.156", "185.220.101.34", "91.219.236.222",
    "198.51.100.78", "203.0.113.45", "104.248.50.87",
    "78.128.113.66", "162.247.74.27", "185.56.80.65",
    "23.129.64.100", "109.70.100.33", "51.15.43.205",
]

ASSETS = [
    "SRV-WEB-01", "SRV-DB-01", "SRV-MAIL-01", "SRV-APP-01",
    "WS-ADMIN-PC", "WS-DEV-03", "WS-HR-07", "FW-EDGE-01",
    "SW-CORE-01", "SRV-FILE-02", "SRV-DNS-01", "SRV-VPN-01",
]

SENSOR_IDS = {
    SensorType.NETWORK_IDS: ["NIDS-001", "NIDS-002", "NIDS-003"],
    SensorType.HOST_IDS: ["HIDS-001", "HIDS-002"],
    SensorType.FIREWALL: ["FW-001", "FW-002"],
    SensorType.WAF: ["WAF-001"],
    SensorType.ENDPOINT: ["EDR-001", "EDR-002", "EDR-003"],
    SensorType.EMAIL_GATEWAY: ["EMG-001"],
}

# ─────────────────────────────────────────────────────
# PLANTILLAS DE AMENAZAS (con mapeo MITRE ATT&CK)
# ─────────────────────────────────────────────────────

THREAT_TEMPLATES = {
    ThreatType.PHISHING: {
        "severity_weights": [SeverityLevel.MEDIUM, SeverityLevel.HIGH, SeverityLevel.HIGH, SeverityLevel.CRITICAL],
        "sensors": [SensorType.EMAIL_GATEWAY, SensorType.ENDPOINT],
        "ports": [(25, 587), (443, 443)],
        "protocols": ["SMTP", "HTTPS"],
        "mitre_tactic": "Initial Access",
        "mitre_technique": "T1566 - Phishing",
        "titles": [
            "Email de phishing detectado con adjunto malicioso",
            "URL sospechosa en correo entrante",
            "Intento de spear-phishing dirigido a ejecutivo",
            "Correo con payload codificado en Base64",
        ],
        "descriptions": [
            "Se interceptó un correo con archivo .exe disfrazado como factura PDF desde {src}",
            "Link acortado detectado en correo de {src} redirigiendo a dominio de phishing conocido",
            "Correo dirigido suplantando al CEO, solicitando transferencia urgente desde {src}",
            "Adjunto .docm con macros maliciosas detectado en correo proveniente de {src}",
        ],
        "confidence_range": (70.0, 95.0),
    },
    ThreatType.PORT_SCAN: {
        "severity_weights": [SeverityLevel.LOW, SeverityLevel.LOW, SeverityLevel.MEDIUM],
        "sensors": [SensorType.NETWORK_IDS, SensorType.FIREWALL],
        "ports": [(1, 1024), (1, 65535)],
        "protocols": ["TCP", "UDP"],
        "mitre_tactic": "Discovery",
        "mitre_technique": "T1046 - Network Service Scanning",
        "titles": [
            "Escaneo de puertos SYN detectado",
            "Escaneo horizontal de subred detectado",
            "Enumeración de servicios en curso",
            "Escaneo de puertos tipo XMAS detectado",
        ],
        "descriptions": [
            "{count} intentos de conexión SYN a puertos consecutivos desde {src}",
            "Barrido de red detectado: {src} escaneando rango {dst_range}",
            "Fingerprinting de servicios activo desde {src} usando Nmap signatures",
            "Paquetes con flags FIN/PSH/URG desde {src} (escaneo XMAS)",
        ],
        "confidence_range": (60.0, 90.0),
    },
    ThreatType.UNAUTHORIZED_ACCESS: {
        "severity_weights": [SeverityLevel.HIGH, SeverityLevel.CRITICAL, SeverityLevel.CRITICAL],
        "sensors": [SensorType.HOST_IDS, SensorType.NETWORK_IDS],
        "ports": [(22, 22), (3389, 3389), (445, 445)],
        "protocols": ["TCP", "SSH", "RDP"],
        "mitre_tactic": "Credential Access",
        "mitre_technique": "T1078 - Valid Accounts",
        "titles": [
            "Acceso SSH no autorizado desde IP externa",
            "Login RDP sospechoso fuera de horario laboral",
            "Escalación de privilegios detectada",
            "Acceso a recurso compartido con credenciales comprometidas",
        ],
        "descriptions": [
            "Sesión SSH establecida desde {src} usando credenciales del usuario 'admin' a las 03:47 AM",
            "Conexión RDP exitosa desde IP no registrada {src} al servidor {asset}",
            "Usuario 'jperez' ejecutó sudo sin autorización previa en {asset}",
            "Acceso SMB desde {src} usando hash NTLM del usuario 'svc_backup'",
        ],
        "confidence_range": (80.0, 98.0),
    },
    ThreatType.DDOS: {
        "severity_weights": [SeverityLevel.HIGH, SeverityLevel.CRITICAL, SeverityLevel.CRITICAL],
        "sensors": [SensorType.NETWORK_IDS, SensorType.FIREWALL, SensorType.WAF],
        "ports": [(80, 80), (443, 443), (53, 53)],
        "protocols": ["TCP", "UDP", "HTTP", "HTTPS"],
        "mitre_tactic": "Impact",
        "mitre_technique": "T1498 - Network Denial of Service",
        "titles": [
            "Ataque DDoS volumétrico en curso",
            "SYN Flood detectado contra servidor web",
            "Amplificación DNS utilizada en ataque DDoS",
            "HTTP Flood contra API endpoint crítico",
        ],
        "descriptions": [
            "Tráfico entrante anómalo: {rate} Gbps desde múltiples orígenes hacia {dst}",
            "SYN flood: {count} paquetes SYN/seg desde red {src} hacia {asset}",
            "Respuestas DNS amplificadas originadas desde {src} dirigidas a {dst}",
            "Flood HTTP POST al endpoint /api/login con {count} req/seg desde {src}",
        ],
        "confidence_range": (85.0, 99.0),
    },
    ThreatType.MALWARE: {
        "severity_weights": [SeverityLevel.HIGH, SeverityLevel.CRITICAL],
        "sensors": [SensorType.ENDPOINT, SensorType.HOST_IDS],
        "ports": [(443, 443), (8080, 8080), (4444, 4444)],
        "protocols": ["TCP", "HTTPS", "HTTP"],
        "mitre_tactic": "Execution",
        "mitre_technique": "T1204 - User Execution",
        "titles": [
            "Troyano detectado en estación de trabajo",
            "Comunicación C2 (Command & Control) detectada",
            "Dropper ejecutado en memoria",
            "Keylogger activo detectado por EDR",
        ],
        "descriptions": [
            "Archivo malicioso 'invoice_Q4.exe' ejecutado en {asset} — hash SHA256 conocido",
            "Conexión beacon cada 60s desde {asset} hacia C2 en {dst} puerto 443",
            "Proceso powershell.exe cargó payload en memoria sin tocar disco en {asset}",
            "Proceso sospechoso capturando keystrokes del usuario en {asset}",
        ],
        "confidence_range": (75.0, 99.0),
    },
    ThreatType.BRUTE_FORCE: {
        "severity_weights": [SeverityLevel.MEDIUM, SeverityLevel.HIGH, SeverityLevel.HIGH],
        "sensors": [SensorType.HOST_IDS, SensorType.NETWORK_IDS, SensorType.FIREWALL],
        "ports": [(22, 22), (3389, 3389), (21, 21), (443, 443)],
        "protocols": ["SSH", "RDP", "FTP", "HTTPS"],
        "mitre_tactic": "Credential Access",
        "mitre_technique": "T1110 - Brute Force",
        "titles": [
            "Ataque de fuerza bruta SSH en progreso",
            "Múltiples intentos fallidos de login RDP",
            "Dictionary attack contra FTP server",
            "Credential stuffing contra portal web",
        ],
        "descriptions": [
            "{count} intentos de login SSH fallidos desde {src} en los últimos 5 minutos",
            "IP {src} registró {count} logins RDP fallidos contra {asset}",
            "Ataque de diccionario FTP: {count} passwords probados desde {src}",
            "Credential stuffing: {count} combinaciones user/pass probadas desde {src}",
        ],
        "confidence_range": (65.0, 92.0),
    },
    ThreatType.SQL_INJECTION: {
        "severity_weights": [SeverityLevel.HIGH, SeverityLevel.CRITICAL],
        "sensors": [SensorType.WAF, SensorType.NETWORK_IDS],
        "ports": [(80, 80), (443, 443), (8080, 8080)],
        "protocols": ["HTTP", "HTTPS"],
        "mitre_tactic": "Initial Access",
        "mitre_technique": "T1190 - Exploit Public-Facing Application",
        "titles": [
            "Inyección SQL detectada en parámetro de búsqueda",
            "SQLi ciega (blind) contra endpoint de autenticación",
            "Intento de UNION-based SQLi bloqueado",
            "SQL injection con evasión de WAF detectada",
        ],
        "descriptions": [
            "Payload SQLi detectado: ' OR 1=1-- en parámetro 'search' desde {src}",
            "Múltiples intentos de SQLi ciega basada en tiempo desde {src} contra /api/login",
            "UNION SELECT con enumeración de tablas bloqueado desde {src}",
            "Payload SQLi con codificación doble URL desde {src} intentando evadir WAF",
        ],
        "confidence_range": (80.0, 97.0),
    },
    ThreatType.XSS: {
        "severity_weights": [SeverityLevel.MEDIUM, SeverityLevel.HIGH],
        "sensors": [SensorType.WAF, SensorType.NETWORK_IDS],
        "ports": [(80, 80), (443, 443)],
        "protocols": ["HTTP", "HTTPS"],
        "mitre_tactic": "Initial Access",
        "mitre_technique": "T1189 - Drive-by Compromise",
        "titles": [
            "Cross-Site Scripting reflejado detectado",
            "XSS almacenado inyectado en campo de comentarios",
            "XSS DOM-based detectado en parámetro de URL",
        ],
        "descriptions": [
            "Payload <script>alert(1)</script> detectado en parámetro 'q' desde {src}",
            "Script malicioso inyectado en formulario público por {src}",
            "Manipulación DOM vía fragment URL desde {src} hacia {asset}",
        ],
        "confidence_range": (70.0, 90.0),
    },
    ThreatType.DATA_EXFILTRATION: {
        "severity_weights": [SeverityLevel.CRITICAL, SeverityLevel.CRITICAL],
        "sensors": [SensorType.NETWORK_IDS, SensorType.HOST_IDS, SensorType.FIREWALL],
        "ports": [(443, 443), (53, 53), (22, 22)],
        "protocols": ["HTTPS", "DNS", "SCP"],
        "mitre_tactic": "Exfiltration",
        "mitre_technique": "T1048 - Exfiltration Over Alternative Protocol",
        "titles": [
            "Exfiltración de datos vía túnel DNS detectada",
            "Transferencia masiva de archivos a IP externa",
            "Datos sensibles detectados en tráfico HTTPS saliente",
        ],
        "descriptions": [
            "Consultas DNS anómalas con payloads codificados desde {asset} hacia {dst}",
            "Transferencia SCP de 2.3GB desde {asset} hacia IP externa {dst}",
            "DLP detectó PII (datos personales) en tráfico HTTPS desde {asset} hacia {dst}",
        ],
        "confidence_range": (85.0, 99.0),
    },
    ThreatType.RANSOMWARE: {
        "severity_weights": [SeverityLevel.CRITICAL],
        "sensors": [SensorType.ENDPOINT, SensorType.HOST_IDS],
        "ports": [(445, 445), (443, 443)],
        "protocols": ["SMB", "HTTPS"],
        "mitre_tactic": "Impact",
        "mitre_technique": "T1486 - Data Encrypted for Impact",
        "titles": [
            "Actividad de ransomware detectada — encriptación masiva",
            "Propagación lateral de ransomware vía SMB",
            "Nota de rescate creada en múltiples directorios",
        ],
        "descriptions": [
            "Proceso sospechoso encriptando archivos en {asset} — 847 archivos afectados en 2 min",
            "Ransomware propagándose vía SMB desde {asset} hacia segmento {dst_range}",
            "Archivo 'README_DECRYPT.txt' creado en 23 directorios de {asset}",
        ],
        "confidence_range": (90.0, 99.9),
    },
}


# ─────────────────────────────────────────────────────
# GENERADOR DE ALERTAS
# ─────────────────────────────────────────────────────

def generate_alert() -> SecurityAlert:
    """Genera una alerta de seguridad simulada con datos realistas."""
    
    # Seleccionar tipo de amenaza con peso (las críticas son menos frecuentes)
    threat_weights = {
        ThreatType.PORT_SCAN: 20,
        ThreatType.BRUTE_FORCE: 18,
        ThreatType.PHISHING: 15,
        ThreatType.SQL_INJECTION: 12,
        ThreatType.XSS: 10,
        ThreatType.MALWARE: 8,
        ThreatType.UNAUTHORIZED_ACCESS: 7,
        ThreatType.DDOS: 5,
        ThreatType.DATA_EXFILTRATION: 3,
        ThreatType.RANSOMWARE: 2,
    }
    
    threat_type = random.choices(
        list(threat_weights.keys()),
        weights=list(threat_weights.values()),
        k=1
    )[0]
    
    template = THREAT_TEMPLATES[threat_type]
    
    # Datos de red
    src_ip = random.choice(EXTERNAL_IPS)
    dst_ip = random.choice(INTERNAL_IPS)
    sensor_type = random.choice(template["sensors"])
    sensor_id = random.choice(SENSOR_IDS[sensor_type])
    port_pair = random.choice(template["ports"])
    protocol = random.choice(template["protocols"])
    asset = random.choice(ASSETS)
    
    # Seleccionar título y descripción
    idx = random.randint(0, len(template["titles"]) - 1)
    desc_idx = idx if idx < len(template["descriptions"]) else 0
    title = template["titles"][idx]
    description = template["descriptions"][desc_idx].format(
        src=src_ip,
        dst=dst_ip,
        asset=asset,
        count=random.randint(50, 5000),
        rate=round(random.uniform(0.5, 25.0), 1),
        dst_range=f"{dst_ip.rsplit('.', 1)[0]}.0/24",
    )
    
    # Generar raw log simulado
    raw_log = (
        f"[{datetime.utcnow().isoformat()}] "
        f"{sensor_id} {protocol} {src_ip}:{random.randint(1024, 65535)} -> "
        f"{dst_ip}:{port_pair[1]} | "
        f"ALERT: {title} | "
        f"SID:{random.randint(2000000, 2999999)}"
    )
    
    # Confidence
    conf_min, conf_max = template["confidence_range"]
    confidence = round(random.uniform(conf_min, conf_max), 1)
    
    return SecurityAlert(
        alert_id=str(uuid.uuid4()),
        threat_type=threat_type,
        severity=random.choice(template["severity_weights"]),
        status=AlertStatus.NEW,
        sensor_type=sensor_type,
        sensor_id=sensor_id,
        source_ip=src_ip,
        destination_ip=dst_ip,
        source_port=random.randint(1024, 65535),
        destination_port=port_pair[1],
        protocol=protocol,
        title=title,
        description=description,
        raw_log=raw_log,
        affected_asset=asset,
        mitre_tactic=template["mitre_tactic"],
        mitre_technique=template["mitre_technique"],
        confidence_score=confidence,
        timestamp=datetime.utcnow(),
    )


if __name__ == "__main__":
    # Generar una alerta de prueba si se ejecuta directamente
    print("🧪 Generando alerta de prueba (ejecuta 'main.py' para el simulador completo):")
    test_alert = generate_alert()
    import json
    print(json.dumps(test_alert.model_dump(mode="json"), indent=2, ensure_ascii=False))
