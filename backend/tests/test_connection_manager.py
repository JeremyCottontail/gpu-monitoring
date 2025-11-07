import asyncio

import pytest

from app.services.connection_manager import ConnectionManager


class DummyWebSocket:
    def __init__(self):
        self.sent = []
        self.accepted = False

    async def accept(self):
        self.accepted = True

    async def send_text(self, data):
        self.sent.append(data)


@pytest.mark.asyncio
async def test_broadcast_debounces_identical_payloads():
    manager = ConnectionManager(broadcast_hz=1000)
    ws = DummyWebSocket()
    await manager.connect(ws)
    payload = {"a": 1}
    await manager.broadcast(payload)
    await manager.broadcast(payload)
    assert len(ws.sent) == 1


@pytest.mark.asyncio
async def test_disconnect_removes_connection():
    manager = ConnectionManager(broadcast_hz=1)
    ws = DummyWebSocket()
    await manager.connect(ws)
    await manager.disconnect(ws)
    assert ws not in manager._connections


