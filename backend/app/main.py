import asyncio
from datetime import datetime

from fastapi import Depends, FastAPI, WebSocket
from starlette.websockets import WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import Settings, get_settings
from .core.logging import configure_logging
from .services.connection_manager import ConnectionManager
from .telemetry.factory import get_telemetry_provider


app = FastAPI(title="GPU Monitoring Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

settings = get_settings()
configure_logging(settings.log_level)

connection_manager = ConnectionManager(broadcast_hz=settings.ws_max_rate_hz)
telemetry_provider = get_telemetry_provider(settings)


@app.on_event("startup")
async def startup_event() -> None:
    await telemetry_provider.start()


@app.on_event("shutdown")
async def shutdown_event() -> None:
    await telemetry_provider.stop()


@app.get("/api/health", name="health")
async def health(settings: Settings = Depends(get_settings)) -> JSONResponse:
    payload = {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "pollIntervalMs": settings.poll_interval_ms,
        "provider": telemetry_provider.name,
    }
    return JSONResponse(payload)


@app.get("/api/config", name="config")
async def config(settings: Settings = Depends(get_settings)) -> JSONResponse:
    payload = {
        "pollIntervalMs": settings.poll_interval_ms,
        "maxBroadcastHz": settings.ws_max_rate_hz,
        "provider": telemetry_provider.name,
        "enableSystemMetrics": settings.enable_system_metrics,
    }
    return JSONResponse(payload)


@app.websocket("/ws/gpu")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await connection_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    except Exception:
        raise
    finally:
        await connection_manager.disconnect(websocket)


@app.on_event("startup")
async def start_broadcast_loop() -> None:
    async def broadcast_loop() -> None:
        async for payload in telemetry_provider.stream():
            await connection_manager.broadcast(payload)

    asyncio.create_task(broadcast_loop())


