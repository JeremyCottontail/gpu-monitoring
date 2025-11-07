from __future__ import annotations

import platform
import time
from typing import Dict


try:  # pragma: no cover - optional dependency
    import psutil
except Exception:  # pragma: no cover - fallback path
    psutil = None  # type: ignore


def gather_system_metrics() -> Dict:
    if psutil is None:
        return {}

    cpu = psutil.cpu_percent(interval=None)
    memory = psutil.virtual_memory()
    load_avg = psutil.getloadavg() if hasattr(psutil, "getloadavg") else (0.0, 0.0, 0.0)
    boot_time = psutil.boot_time()

    return {
        "system": {
            "cpuUsage": cpu,
            "memoryUsage": round(memory.percent, 2),
            "memoryUsed": memory.used,
            "memoryTotal": memory.total,
            "loadAverage": list(load_avg),
            "uptimeSeconds": int(time.time() - boot_time),
            "hostname": platform.node(),
        }
    }


