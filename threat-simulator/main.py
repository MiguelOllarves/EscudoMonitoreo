"""
main.py — API FastAPI del Simulador de Amenazas de Ciberseguridad.

Endpoints:
  GET  /                    → Health check
  GET  /status              → Estado del simulador
  POST /config              → Modificar configuración en caliente
  GET  /alerts/generate     → Generar una alerta individual
  GET  /alerts/stream       → Stream SSE de alertas en tiempo real
  POST /simulation/start    → Iniciar generación automática
  POST /simulation/stop     → Detener generación automática
  GET  /alerts/history      → Últimas N alertas generadas
"""

import asyncio
import time
import os
import json
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from models import SecurityAlert, SimulatorStatus, SimulatorConfig
from simulator import generate_alert

load_dotenv()

# ─────────────────────────────────────────────────────
# ESTADO GLOBAL DEL SIMULADOR
# ─────────────────────────────────────────────────────

class SimulatorState:
    def __init__(self):
        self.is_running: bool = False
        self.alerts_generated: int = 0
        self.alerts_forwarded: int = 0
        self.start_time: float = time.time()
        self.alert_interval: float = float(os.getenv("ALERT_INTERVAL_SECONDS", "3"))
        self.forward_mode: str = os.getenv("FORWARD_MODE", "local")
        self.backend_url: str = os.getenv("NESTJS_BACKEND_URL", "http://localhost:3000/api/alerts/ingest")
        self.history: list[SecurityAlert] = []
        self.max_history: int = 200
        self._task: Optional[asyncio.Task] = None

state = SimulatorState()


# ─────────────────────────────────────────────────────
# LIFECYCLE
# ─────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🛡️  CyberShield Threat Simulator iniciado")
    print(f"   Modo: {state.forward_mode} | Intervalo: {state.alert_interval}s")
    
    # Iniciar simulación automáticamente al arrancar
    if not state.is_running:
        state.is_running = True
        state._task = asyncio.create_task(_simulation_loop())
        print(f"✅ Generación automática activada (intervalo: {state.alert_interval}s)")
        
    yield
    
    if state._task and not state._task.done():
        state.is_running = False
        state._task.cancel()
    print("🛡️  Simulador detenido")

app = FastAPI(
    title="CyberShield - Simulador de Amenazas",
    description="Microservicio que genera alertas de ciberseguridad simuladas para el sistema de monitoreo.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────
# FUNCIONES AUXILIARES
# ─────────────────────────────────────────────────────

def _store_alert(alert: SecurityAlert):
    """Almacena alerta en historial circular."""
    state.history.append(alert)
    if len(state.history) > state.max_history:
        state.history = state.history[-state.max_history:]
    state.alerts_generated += 1


async def _forward_alert(alert: SecurityAlert):
    """Envía alerta al backend NestJS (Fase 2)."""
    if state.forward_mode != "forward":
        return
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(
                state.backend_url,
                json=alert.model_dump(mode="json"),
            )
            if resp.status_code in (200, 201):
                state.alerts_forwarded += 1
            else:
                print(f"⚠️  Backend respondió {resp.status_code}")
    except Exception as e:
        print(f"⚠️  Error enviando al backend: {e}")


async def _simulation_loop():
    """Loop principal de generación automática."""
    while state.is_running:
        alert = generate_alert()
        _store_alert(alert)
        await _forward_alert(alert)
        print(f"🔴 [{alert.severity.value.upper():>8}] {alert.threat_type.value:<25} | {alert.title}")
        await asyncio.sleep(state.alert_interval)


# ─────────────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def health_check():
    return {
        "service": "CyberShield Threat Simulator",
        "status": "online",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/status", response_model=SimulatorStatus, tags=["Control"])
async def get_status():
    return SimulatorStatus(
        is_running=state.is_running,
        alerts_generated=state.alerts_generated,
        alerts_forwarded=state.alerts_forwarded,
        uptime_seconds=round(time.time() - state.start_time, 2),
        forward_mode=state.forward_mode,
        alert_interval=state.alert_interval,
    )


@app.post("/config", tags=["Control"])
async def update_config(config: SimulatorConfig):
    if config.alert_interval is not None:
        state.alert_interval = config.alert_interval
    if config.forward_mode is not None:
        state.forward_mode = config.forward_mode
    return {"message": "Configuración actualizada", "new_interval": state.alert_interval, "new_mode": state.forward_mode}


@app.get("/alerts/generate", response_model=SecurityAlert, tags=["Alertas"])
async def generate_single_alert():
    """Genera y retorna una sola alerta (sin iniciar el loop automático)."""
    alert = generate_alert()
    _store_alert(alert)
    await _forward_alert(alert)
    return alert


@app.post("/simulation/start", tags=["Control"])
async def start_simulation():
    if state.is_running:
        return {"message": "La simulación ya está en ejecución"}
    state.is_running = True
    state._task = asyncio.create_task(_simulation_loop())
    return {"message": f"✅ Simulación iniciada — generando alertas cada {state.alert_interval}s"}


@app.post("/simulation/stop", tags=["Control"])
async def stop_simulation():
    if not state.is_running:
        return {"message": "La simulación no está en ejecución"}
    state.is_running = False
    if state._task and not state._task.done():
        state._task.cancel()
    return {"message": "⛔ Simulación detenida", "total_generated": state.alerts_generated}


@app.get("/alerts/stream", tags=["Alertas"])
async def stream_alerts():
    """Server-Sent Events (SSE) — Stream en tiempo real de alertas."""
    async def event_generator():
        while True:
            alert = generate_alert()
            _store_alert(alert)
            data = alert.model_dump_json()
            yield f"data: {data}\n\n"
            await asyncio.sleep(state.alert_interval)
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


@app.get("/alerts/history", tags=["Alertas"])
async def get_history(limit: int = Query(default=50, ge=1, le=200)):
    """Retorna las últimas N alertas generadas."""
    return {
        "total": len(state.history),
        "limit": limit,
        "alerts": [a.model_dump(mode="json") for a in state.history[-limit:]],
    }


# ─────────────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("SIMULATOR_PORT", "8100"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
