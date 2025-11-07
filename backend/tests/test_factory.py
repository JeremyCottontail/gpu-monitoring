import pytest

from app.config import Settings
from app.telemetry import factory
from app.telemetry.base import TelemetryProvider


class DummyProvider(TelemetryProvider):
    name = "dummy"

    async def snapshot(self):
        return {"timestamp": "now", "gpus": []}


def test_factory_prefers_forced_provider(monkeypatch):
    monkeypatch.setitem(factory.PROVIDERS, "dummy", DummyProvider)
    settings = Settings(telemetry_provider="dummy")
    provider = factory.get_telemetry_provider(settings)
    assert provider.name == "dummy"


def test_factory_raises_when_no_provider(monkeypatch):
    monkeypatch.setattr(factory, "PROVIDERS", {})
    settings = Settings(telemetry_provider="unknown")
    with pytest.raises(RuntimeError):
        factory.get_telemetry_provider(settings)


