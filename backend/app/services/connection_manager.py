import asyncio
import json
from typing import Any, Set

from fastapi import WebSocket


class ConnectionManager:
    """Manage WebSocket connections and broadcast payloads with rate limiting."""

    def __init__(self, broadcast_hz: int = 5) -> None:
        self._connections: Set[WebSocket] = set()
        self._lock = asyncio.Lock()
        self._min_interval = 1.0 / max(broadcast_hz, 1)
        self._last_message: str | None = None
        self._last_sent_at: float = 0.0

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self._connections.add(websocket)

    async def disconnect(self, websocket: WebSocket) -> None:
        async with self._lock:
            self._connections.discard(websocket)

    async def broadcast(self, payload: dict[str, Any]) -> None:
        if not self._connections:
            return

        message = json.dumps(payload)
        if self._last_message == message:
            return

        await self._throttle()

        to_remove: Set[WebSocket] = set()
        async with self._lock:
            for connection in self._connections:
                try:
                    await connection.send_text(message)
                except Exception:
                    to_remove.add(connection)

            for connection in to_remove:
                self._connections.discard(connection)

        self._last_message = message

    async def broadcast_error(self, message: str) -> None:
        if not self._connections:
            return

        payload = json.dumps({"type": "error", "message": message})
        async with self._lock:
            for connection in list(self._connections):
                try:
                    await connection.send_text(payload)
                except Exception:
                    self._connections.discard(connection)

    async def _throttle(self) -> None:
        now = asyncio.get_event_loop().time()
        elapsed = now - self._last_sent_at
        if elapsed < self._min_interval:
            await asyncio.sleep(self._min_interval - elapsed)
        self._last_sent_at = asyncio.get_event_loop().time()


