from __future__ import annotations

import json
import logging
import shlex
import subprocess
from datetime import datetime, timezone
from typing import Dict, List, Optional

from .base import TelemetryProvider
from .system_metrics import gather_system_metrics

LOGGER = logging.getLogger(__name__)


QUERY_FIELDS = [
    "index",
    "uuid",
    "name",
    "driver_version",
    "memory.used",
    "memory.free",
    "memory.total",
    "utilization.gpu",
    "utilization.memory",
    "temperature.gpu",
    "power.draw",
    "power.limit",
]


class NvidiaSmiTelemetryProvider(TelemetryProvider):
    name = "nvidia_smi"

    def __init__(self, poll_interval_ms: int = 1000, include_system: bool = True) -> None:
        super().__init__(poll_interval_ms, include_system)

    async def snapshot(self) -> Optional[Dict]:
        command = [
            "nvidia-smi",
            f"--query-gpu={','.join(QUERY_FIELDS)}",
            "--format=csv,noheader,nounits",
        ]
        try:
            result = subprocess.run(command, check=True, capture_output=True, text=True)
            lines = [line for line in result.stdout.strip().splitlines() if line]
        except Exception as exc:
            LOGGER.error("Failed to execute nvidia-smi", exc_info=exc)
            return None

        gpus: List[Dict] = []
        for line in lines:
            parts = [part.strip() for part in line.split(",")]
            data = dict(zip(QUERY_FIELDS, parts))
            gpus.append(
                {
                    "id": int(data.get("index", 0)),
                    "uuid": data.get("uuid"),
                    "name": data.get("name"),
                    "driverVersion": data.get("driver_version"),
                    "utilization": try_parse_float(data.get("utilization.gpu")),
                    "memoryUsed": try_parse_float(data.get("memory.used")),
                    "memoryFree": try_parse_float(data.get("memory.free")),
                    "memoryTotal": try_parse_float(data.get("memory.total")),
                    "temperature": try_parse_float(data.get("temperature.gpu")),
                    "powerUsage": try_parse_float(data.get("power.draw")),
                    "powerLimit": try_parse_float(data.get("power.limit")),
                    "processes": [],
                }
            )

        payload: Dict = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "gpus": gpus,
        }

        if self.include_system:
            payload.update(gather_system_metrics())

        return payload


def try_parse_float(value: Optional[str]) -> Optional[float]:  # pragma: no cover
    if value is None:
        return None
    try:
        return float(value)
    except ValueError:
        return None


