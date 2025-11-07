from __future__ import annotations

import json
import logging
import subprocess
from datetime import datetime, timezone
from typing import Dict, Optional

from .base import TelemetryProvider
from .system_metrics import gather_system_metrics

LOGGER = logging.getLogger(__name__)


class NvtopTelemetryProvider(TelemetryProvider):
    name = "nvtop"

    def __init__(self, poll_interval_ms: int = 1000, include_system: bool = True) -> None:
        super().__init__(poll_interval_ms, include_system)

    async def snapshot(self) -> Optional[Dict]:
        try:
            result = subprocess.run(
                ["nvtop", "--json"],
                capture_output=True,
                text=True,
                check=True,
            )
        except Exception as exc:
            LOGGER.error("Failed to execute nvtop", exc_info=exc)
            return None

        try:
            data = json.loads(result.stdout)
        except json.JSONDecodeError as exc:
            LOGGER.error("Invalid nvtop JSON", exc_info=exc)
            return None

        gpus = []
        for gpu in data.get("gpus", []):
            gpus.append(
                {
                    "id": gpu.get("index"),
                    "uuid": gpu.get("uuid"),
                    "name": gpu.get("product_name"),
                    "driverVersion": gpu.get("driver_version"),
                    "utilization": gpu.get("utilization"),
                    "memoryUsed": gpu.get("memory", {}).get("usedMiB"),
                    "memoryTotal": gpu.get("memory", {}).get("totalMiB"),
                    "temperature": gpu.get("temperatureC"),
                    "powerUsage": gpu.get("powerW"),
                    "powerLimit": gpu.get("powerLimitW"),
                    "fanSpeed": gpu.get("fanSpeedPct"),
                    "encoderUtilization": gpu.get("encoderUtilization"),
                    "decoderUtilization": gpu.get("decoderUtilization"),
                    "processes": [
                        {
                            "pid": proc.get("pid"),
                            "name": proc.get("name"),
                            "usedMemoryMiB": proc.get("usedMemoryMiB"),
                        }
                        for proc in gpu.get("processes", [])
                    ],
                }
            )

        payload: Dict = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "gpus": gpus,
        }

        if self.include_system:
            payload.update(gather_system_metrics())

        return payload


