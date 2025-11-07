import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Cpu, RefreshCw } from "lucide-react";
import { GpuCard } from "@/components/GpuCard";
import { StatusBadge } from "@/components/StatusBadge";
import { SystemStats } from "@/components/SystemStats";
import { useGpuStream } from "@/hooks/useGpuStream";
import type { TelemetryPayload } from "@/types";

type HistoryEntry = {
  utilization: number[];
  memory: number[];
};

const MAX_HISTORY = 60;

const useHistory = () => {
  const [history, setHistory] = useState<Record<number, HistoryEntry>>({});

  const update = useCallback((payload: TelemetryPayload | null) => {
    if (!payload) return;
    setHistory((prev) => {
      const next: Record<number, HistoryEntry> = { ...prev };
      payload.gpus.forEach((gpu) => {
        const existing = next[gpu.id] ?? { utilization: [], memory: [] };
        next[gpu.id] = {
          utilization: append(existing.utilization, gpu.utilization ?? 0),
          memory: append(existing.memory, percentMemory(gpu)),
        };
      });
      return next;
    });
  }, []);

  return { history, update };
};

const append = (values: number[], value: number) => {
  const next = [...values, value];
  if (next.length > MAX_HISTORY) next.shift();
  return next;
};

const percentMemory = (gpu: TelemetryPayload["gpus"][number]) => {
  if (!gpu.memoryTotal || gpu.memoryTotal <= 0 || gpu.memoryUsed === null || gpu.memoryUsed === undefined) {
    return 0;
  }
  return Math.min(100, Math.round((gpu.memoryUsed / gpu.memoryTotal) * 100));
};

const average = (values: number[]) => {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const App = () => {
  const { data, status, error, reconnect } = useGpuStream();
  const { history, update } = useHistory();

  useEffect(() => {
    update(data ?? null);
  }, [data, update]);

  const aggregateUtilization = useMemo(() => {
    if (!data?.gpus?.length) return 0;
    return (
      data.gpus.reduce((sum, gpu) => sum + (gpu.utilization ?? 0), 0) /
      Math.max(data.gpus.length, 1)
    );
  }, [data]);

  const totalMemory = useMemo(() => {
    if (!data?.gpus?.length) return { used: 0, total: 0 };
    return data.gpus.reduce(
      (acc, gpu) => ({
        used: acc.used + (gpu.memoryUsed ?? 0),
        total: acc.total + (gpu.memoryTotal ?? 0),
      }),
      { used: 0, total: 0 }
    );
  }, [data]);

  return (
    <div className="min-h-screen bg-gradient-hero pb-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pt-12 lg:pt-16">
        <motion.header
          className="glass-panel relative overflow-hidden px-8 py-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent-500/30 blur-3xl" />
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <StatusBadge status={status} />
              <h1 className="mt-4 font-display text-4xl text-white md:text-5xl">
                Real-Time GPU Observatory
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                Track utilization, memory, thermals, and active workloads across every GPU. Designed
                for AI rigs that demand immediate insight.
              </p>
            </div>
            <div className="glass-panel flex flex-col gap-3 bg-white/5 p-6">
              <div className="flex items-center gap-3 text-slate-300">
                <Activity className="h-5 w-5 text-accent-200" />
                <span className="text-xs uppercase tracking-[0.3em]">Avg Utilization</span>
              </div>
              <span className="font-display text-4xl text-white">{Math.round(aggregateUtilization)}%</span>
              <div className="flex items-center gap-3 text-slate-300">
                <Cpu className="h-5 w-5 text-primary-200" />
                <span className="text-xs uppercase tracking-[0.3em]">
                  Memory {Math.round(totalMemory.used)} / {Math.round(totalMemory.total)} MiB
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              <p>{error}</p>
              <button
                onClick={reconnect}
                className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 px-3 py-1 text-xs uppercase tracking-wide"
              >
                <RefreshCw className="h-3 w-3" /> Retry
              </button>
            </div>
          )}
        </motion.header>

        <SystemStats metrics={data?.system} />

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {data?.gpus?.map((gpu) => (
            <GpuCard
              key={gpu.id}
              gpu={gpu}
              utilizationHistory={history[gpu.id]?.utilization ?? []}
              memoryHistory={history[gpu.id]?.memory ?? []}
            />
          ))}
        </section>

        {!data?.gpus?.length && status !== "connecting" && (
          <div className="glass-panel text-center py-16 text-slate-300">
            No GPUs detected. Ensure the telemetry service is running.
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

