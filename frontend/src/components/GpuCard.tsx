import { motion } from "framer-motion";
import { Flame, Gauge, MemoryStick, Thermometer } from "lucide-react";
import type { GpuInfo } from "@/types";
import { formatMemory, formatPercent, formatPower, formatTemperature } from "@/utils/format";
import { MetricSparkline } from "./MetricSparkline";
import { ProcessList } from "./ProcessList";

type Props = {
  gpu: GpuInfo;
  utilizationHistory: number[];
  memoryHistory: number[];
};

export const GpuCard = ({ gpu, utilizationHistory, memoryHistory }: Props) => {
  return (
    <motion.section
      layout
      className="gradient-border relative overflow-hidden rounded-3xl bg-slate-900/60 p-[1px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="glass-panel h-full space-y-6 p-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">GPU #{gpu.id}</p>
            <h3 className="mt-1 font-display text-2xl text-white">{gpu.name ?? "NVIDIA GPU"}</h3>
            <p className="text-xs text-slate-400">{gpu.uuid}</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="rounded-2xl bg-gradient-card px-4 py-3 text-right">
              <p className="text-xs text-slate-300">GPU</p>
              <p className="font-display text-3xl text-white">{formatPercent(gpu.utilization)}</p>
            </div>
            <div className="rounded-2xl bg-gradient-card px-4 py-3 text-right">
              <p className="text-xs text-slate-300">Memory</p>
              <p className="font-display text-3xl text-white">{formatPercent(gpu.memoryUsed && gpu.memoryTotal ? (gpu.memoryUsed / gpu.memoryTotal) * 100 : 0)}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
              <span className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-accent-300" />
                GPU Utilization
              </span>
              <span className="text-xs text-slate-400">Last 60s (0-100%)</span>
            </div>
            <MetricSparkline data={utilizationHistory} stroke="#38BDF8" />
          </div>
          <div className="rounded-2xl bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
              <span className="flex items-center gap-2">
                <MemoryStick className="h-4 w-4 text-primary-200" />
                Memory Usage
              </span>
              <span className="text-xs text-slate-400">{formatMemory(gpu.memoryUsed)} / {formatMemory(gpu.memoryTotal)}</span>
            </div>
            <MetricSparkline data={memoryHistory} stroke="#A855F7" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-slate-300 md:grid-cols-4">
          <Stat label="Temperature" value={formatTemperature(gpu.temperature)} icon={<Thermometer className="h-4 w-4" />} />
          <Stat label="Power" value={formatPower(gpu.powerUsage)} icon={<Flame className="h-4 w-4" />} />
          <Stat label="Fan" value={formatPercent(gpu.fanSpeed)} icon={<Gauge className="h-4 w-4" />} />
          <Stat label="Encoder/Decoder" value={`${formatPercent(gpu.encoderUtilization)} / ${formatPercent(gpu.decoderUtilization)}`} icon={<Gauge className="h-4 w-4" />} />
        </div>

        <div>
          <h4 className="mb-3 text-sm uppercase tracking-[0.25em] text-slate-400">Active Processes</h4>
          <ProcessList processes={gpu.processes} />
        </div>
      </div>
    </motion.section>
  );
};

const Stat = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="rounded-2xl bg-black/30 p-3">
    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
      <span className="text-accent-300">{icon}</span>
      {label}
    </div>
    <p className="mt-2 text-lg font-semibold text-white">{value}</p>
  </div>
);

