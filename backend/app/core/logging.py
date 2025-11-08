import logging
import sys
from typing import Any


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:  # pragma: no cover - logging glue
        payload: dict[str, Any] = {
            "level": record.levelname,
            "name": record.name,
            "message": record.getMessage(),
        }
        standard_keys = {
            "name",
            "msg",
            "args",
            "levelname",
            "levelno",
            "pathname",
            "filename",
            "module",
            "exc_info",
            "exc_text",
            "stack_info",
            "lineno",
            "funcName",
            "created",
            "msecs",
            "relativeCreated",
            "thread",
            "threadName",
            "processName",
            "process",
        }
        extras = {
            key: value
            for key, value in record.__dict__.items()
            if key not in standard_keys and not key.startswith("_")
        }
        if extras:
            payload.update(extras)
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)
        return json_dumps(payload)


def json_dumps(payload: dict[str, Any]) -> str:
    import json

    return json.dumps(payload, default=str)


def configure_logging(level: str) -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    logging.basicConfig(level=level.upper(), handlers=[handler])
