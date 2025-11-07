import { motion } from "framer-motion";
import { Activity, HardDrive, MemoryStick, TimerReset } from "lucide-react";
import type { SystemMetrics } from "@/types";
import { formatPercent, formatUptime } from "@/utils/format";

type Props = {
  metrics?: SystemMetrics;
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <motion.div
    className="glass-panel flex flex-col gap-2 p-4"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-center gap-3 text-slate-300">
      <span className="rounded-full bg-accent-500/10 p-2 text-accent-300">{icon}</span>
      <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
    </div>
    <span className="text-2xl font-semibold text-white">{value}</span>
  </motion.div>
);

export const SystemStats = ({ metrics }: Props) => {
  if (!metrics) return null;

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={<Activity className="h-5 w-5" />} label="CPU" value={formatPercent(metrics.cpuUsage)} />
      <StatCard icon={<MemoryStick className="h-5 w-5" />} label="Memory" value={formatPercent(metrics.memoryUsage)} />
      <StatCard
        icon={<HardDrive className="h-5 w-5" />}
        label="Load Avg"
        value={metrics.loadAverage ? metrics.loadAverage.map((n) => n.toFixed(2)).join(" / ") : "--"}
      />
      <StatCard icon={<TimerReset className="h-5 w-5" />} label="Uptime" value={formatUptime(metrics.uptimeSeconds)} />
    </section>
  );
};

