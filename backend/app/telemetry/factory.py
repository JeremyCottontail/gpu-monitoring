from __future__ import annotations

import logging
from typing import Type

from ..config import Settings
from .base import TelemetryProvider
from .nvidia_smi_provider import NvidiaSmiTelemetryProvider
from .nvtop_provider import NvtopTelemetryProvider
from .pynvml_provider import PynvmlTelemetryProvider

LOGGER = logging.getLogger(__name__)


PROVIDERS: dict[str, Type[TelemetryProvider]] = {
    "pynvml": PynvmlTelemetryProvider,
    "nvidia_smi": NvidiaSmiTelemetryProvider,
    "nvtop": NvtopTelemetryProvider,
}


def get_telemetry_provider(settings: Settings) -> TelemetryProvider:
    order = [
        settings.telemetry_provider,
        "pynvml",
        "nvidia_smi",
        "nvtop",
    ]

    for key in order:
        if not key:
            continue
        provider_cls = PROVIDERS.get(key)
        if not provider_cls:
            continue
        try:
            provider = provider_cls(settings.poll_interval_ms, settings.enable_system_metrics)
            LOGGER.info("Using telemetry provider", extra={"provider": provider.name})
            return provider
        except Exception as exc:
            LOGGER.warning("Failed to initialize provider", extra={"provider": key, "error": str(exc)})

    raise RuntimeError("No telemetry provider available")


