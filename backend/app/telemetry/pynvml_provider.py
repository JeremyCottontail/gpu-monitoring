from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional

from .base import TelemetryProvider
from .system_metrics import gather_system_metrics

LOGGER = logging.getLogger(__name__)

try:  # pragma: no cover - optional dependency
    import pynvml  # type: ignore
except Exception:  # pragma: no cover - fallback path
    pynvml = None


class PynvmlTelemetryProvider(TelemetryProvider):
    name = "pynvml"

    def __init__(self, poll_interval_ms: int = 1000, include_system: bool = True) -> None:
        if pynvml is None:
            raise RuntimeError("pynvml not available")
        super().__init__(poll_interval_ms, include_system)

    async def start(self) -> None:
        pynvml.nvmlInit()

    async def stop(self) -> None:
        try:
            pynvml.nvmlShutdown()
        except Exception:  # pragma: no cover - defensive
            LOGGER.debug("pynvml shutdown failed", exc_info=True)

    async def snapshot(self) -> Optional[Dict]:
        try:
            device_count = pynvml.nvmlDeviceGetCount()
        except Exception as exc:
            LOGGER.error("Failed to query GPU count", exc_info=exc)
            return None

        gpus: List[Dict] = []
        for index in range(device_count):
            handle = pynvml.nvmlDeviceGetHandleByIndex(index)
            memory = pynvml.nvmlDeviceGetMemoryInfo(handle)
            utilization = safe_call(pynvml.nvmlDeviceGetUtilizationRates, handle)
            temperature = safe_call(
                pynvml.nvmlDeviceGetTemperature, handle, pynvml.NVML_TEMPERATURE_GPU
            )
            power_usage = safe_call(pynvml.nvmlDeviceGetPowerUsage, handle)
            power_limit = safe_call(pynvml.nvmlDeviceGetEnforcedPowerLimit, handle)
            fan_speed = safe_call(pynvml.nvmlDeviceGetFanSpeed, handle)
            encoder_util = safe_call(pynvml.nvmlDeviceGetEncoderUtilization, handle)
            decoder_util = safe_call(pynvml.nvmlDeviceGetDecoderUtilization, handle)

            get_processes = getattr(
                pynvml, "nvmlDeviceGetComputeRunningProcesses_v2", None
            )
            if get_processes is None:
                get_processes = getattr(
                    pynvml, "nvmlDeviceGetComputeRunningProcesses", None
                )
            proc_info = safe_call(get_processes, handle) or []

            processes = []
            for proc in proc_info:
                processes.append(
                    {
                        "pid": getattr(proc, "pid", None),
                        "usedMemoryMiB": getattr(proc, "usedGpuMemory", 0)
                        // (1024 * 1024),
                        "name": safe_process_name(proc),
                    }
                )

            gpus.append(
                {
                    "id": index,
                    "name": pynvml.nvmlDeviceGetName(handle),
                    "uuid": pynvml.nvmlDeviceGetUUID(handle),
                    "driverVersion": pynvml.nvmlSystemGetDriverVersion(),
                    "cudaVersion": safe_call(
                        pynvml.nvmlSystemGetCudaDriverVersion_v2
                    ),
                    "utilization": getattr(utilization, "gpu", None)
                    if utilization
                    else None,
                    "memoryUsed": bytes_to_mib(memory.used),
                    "memoryTotal": bytes_to_mib(memory.total),
                    "memoryFree": bytes_to_mib(memory.free),
                    "temperature": temperature,
                    "powerUsage": scale_milli(power_usage),
                    "powerLimit": scale_milli(power_limit),
                    "fanSpeed": fan_speed,
                    "encoderUtilization": unpack_utilization(encoder_util),
                    "decoderUtilization": unpack_utilization(decoder_util),
                    "processes": processes,
                }
            )

        payload: Dict = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "gpus": gpus,
        }

        if self.include_system:
            payload.update(gather_system_metrics())

        return payload


def safe_call(func, *args):  # pragma: no cover - small utility
    if func is None:
        return None
    try:
        return func(*args)
    except Exception:
        LOGGER.debug("Telemetry call failed", exc_info=True)
        return None


def safe_process_name(proc) -> Optional[str]:  # pragma: no cover - optional detail
    try:
        return getattr(proc, "name", None)
    except Exception:
        return None


def scale_milli(value) -> Optional[float]:  # pragma: no cover - simple helper
    if value is None:
        return None
    try:
        return round(float(value) / 1000.0, 2)
    except Exception:
        return None


def bytes_to_mib(value) -> Optional[float]:  # pragma: no cover
    if value is None:
        return None
    try:
        return round(int(value) / (1024 * 1024), 2)
    except Exception:
        return None


def unpack_utilization(value) -> Optional[float]:
    if isinstance(value, (tuple, list)) and value:
        return value[0]
    return value
