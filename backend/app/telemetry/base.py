from __future__ import annotations

import abc
from typing import AsyncIterator, Dict, Optional


class TelemetryProvider(abc.ABC):
    """Abstract telemetry provider interface."""

    name: str = "base"

    def __init__(self, poll_interval_ms: int = 1000, include_system: bool = True) -> None:
        self.poll_interval_ms = poll_interval_ms
        self.include_system = include_system

    async def start(self) -> None:
        """Lifecycle hook for startup."""

    async def stop(self) -> None:
        """Lifecycle hook for shutdown."""

    @abc.abstractmethod
    async def snapshot(self) -> Optional[Dict]:
        """Return a single telemetry snapshot or None when unavailable."""

    async def stream(self) -> AsyncIterator[Dict]:
        """Default stream implementation using snapshot polling."""
        import asyncio

        interval = max(self.poll_interval_ms, 100) / 1000
        while True:
            payload = await self.snapshot()
            if payload:
                yield payload
            await asyncio.sleep(interval)


