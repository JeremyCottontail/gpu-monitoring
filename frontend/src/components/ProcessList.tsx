import { motion } from "framer-motion";
import { Cpu } from "lucide-react";
import type { GpuProcess } from "@/types";
import { formatMemory } from "@/utils/format";

type Props = {
  processes: GpuProcess[];
};

export const ProcessList = ({ processes }: Props) => {
  if (!processes?.length) {
    return (
      <div className="rounded-xl border border-white/5 bg-black/10 px-4 py-3 text-sm text-slate-400">
        No active GPU processes
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {processes.map((proc, idx) => (
        <motion.div
          key={`${proc.pid}-${idx}`}
          layout
          className="flex items-center justify-between rounded-xl bg-black/30 px-3 py-2 text-sm shadow-sm"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-primary-500/20 p-2 text-primary-200">
              <Cpu className="h-4 w-4" />
            </span>
            <div>
              <p className="font-medium text-slate-100">{proc.name ?? "PID " + proc.pid}</p>
              <p className="text-xs text-slate-400">PID {proc.pid ?? "?"}</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-300">
            {formatMemory(proc.usedMemoryMiB ?? undefined)}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

