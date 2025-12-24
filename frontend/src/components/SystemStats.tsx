import { motion } from "framer-motion";
import { Activity, HardDrive, MemoryStick, TimerReset } from "lucide-react";
import type { SystemMetrics } from "@/types";
import { formatPercent, formatUptime } from "@/utils/format";
import { MetricChart } from "./MetricChart";

type Props = {
  metrics?: SystemMetrics;
};

export const SystemStats = ({ metrics }: Props) => {
  if (!metrics) return null;

  // Prepare historical data for charts (assuming we have some history)
  // In a real implementation, this would come from a data store or history tracking
  const cpuHistory = Array(60).fill(0).map(() => Math.random() * 100);
  const memoryHistory = Array(60).fill(0).map(() => Math.random() * 100);

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricChart
        data={cpuHistory}
        title="CPU Usage"
        unit="%"
        color="#3B82F6"
      />
      <MetricChart
        data={memoryHistory}
        title="Memory Usage"
        unit="%"
        color="#10B981"
      />
      <motion.div
        className="glass-panel flex flex-col gap-2 p-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 text-slate-300">
          <span className="rounded-full bg-accent-500/10 p-2 text-accent-300">
            <HardDrive className="h-5 w-5" />
          </span>
          <span className="text-xs uppercase tracking-wide text-slate-400">Load Avg</span>
        </div>
        <span className="text-2xl font-semibold text-white">
          {metrics.loadAverage ? metrics.loadAverage.map((n) => n.toFixed(2)).join(" / ") : "--"}
        </span>
      </motion.div>
      <motion.div
        className="glass-panel flex flex-col gap-2 p-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 text-slate-300">
          <span className="rounded-full bg-accent-500/10 p-2 text-accent-300">
            <TimerReset className="h-5 w-5" />
          </span>
          <span className="text-xs uppercase tracking-wide text-slate-400">Uptime</span>
        </div>
        <span className="text-2xl font-semibold text-white">
          {formatUptime(metrics.uptimeSeconds)}
        </span>
      </motion.div>
    </section>
  );
};

