from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application configuration."""

    poll_interval_ms: int = Field(1000, ge=100, description="Telemetry poll interval in milliseconds")
    ws_max_rate_hz: int = Field(5, ge=1, le=30, description="Maximum WebSocket broadcast frequency")
    log_level: str = Field("INFO", description="Python logging level")
    enable_system_metrics: bool = Field(True, description="Include host system metrics when available")
    telemetry_provider: Optional[str] = Field(
        None,
        description="Force telemetry provider: 'pynvml', 'nvidia_smi', or 'nvtop'. Auto-detect when unset.",
    )

    class Config:
        env_prefix = "GPU_MONITOR_"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""

    return Settings()


