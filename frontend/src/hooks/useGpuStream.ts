import { useCallback, useEffect, useRef, useState } from "react";
import type { StreamStatus, TelemetryPayload } from "@/types";

const RECONNECT_DELAY = 4000;

export const useGpuStream = () => {
  const [status, setStatus] = useState<StreamStatus>("connecting");
  const [data, setData] = useState<TelemetryPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const lastPayloadRef = useRef<string | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    if (reconnectRef.current) {
      window.clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }

    setStatus("connecting");
    setError(null);

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const endpoint =
      import.meta.env.VITE_WS_URL ?? `${protocol}://${window.location.host}/ws/gpu`;

    const socket = new WebSocket(endpoint);
    socketRef.current = socket;

    socket.onopen = () => {
      setStatus("online");
    };

    socket.onmessage = (event) => {
      if (event.data === lastPayloadRef.current) {
        return;
      }

      lastPayloadRef.current = event.data;
      try {
        const parsed = JSON.parse(event.data) as TelemetryPayload;
        setData(parsed);
      } catch (err) {
        console.error("Failed to parse telemetry payload", err);
      }
    };

    socket.onerror = () => {
      setStatus("error");
      setError("WebSocket error");
    };

    socket.onclose = () => {
      setStatus("offline");
      reconnectRef.current = window.setTimeout(() => connect(), RECONNECT_DELAY);
    };
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    if (reconnectRef.current) {
      window.clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    data,
    status,
    error,
    reconnect: connect,
  };
};

export type UseGpuStreamResult = ReturnType<typeof useGpuStream>;

