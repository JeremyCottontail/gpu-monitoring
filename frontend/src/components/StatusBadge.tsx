import { motion } from "framer-motion";
import { Activity, WifiOff, Zap } from "lucide-react";
import type { StreamStatus } from "@/types";

type Props = {
  status: StreamStatus;
  isMockMode?: boolean;
};

const statusConfig: Record<StreamStatus, { label: string; icon: React.ReactNode; color: string }> = {
  connecting: {
    label: "Connecting",
    icon: <Activity className="h-4 w-4" />,
    color: "bg-amber-500/20 text-amber-300",
  },
  online: {
    label: "Live",
    icon: <Zap className="h-4 w-4" />,
    color: "bg-emerald-500/20 text-emerald-300",
  },
  offline: {
    label: "Offline",
    icon: <WifiOff className="h-4 w-4" />,
    color: "bg-slate-500/20 text-slate-300",
  },
  error: {
    label: "Error",
    icon: <WifiOff className="h-4 w-4" />,
    color: "bg-rose-500/20 text-rose-300",
  },
};

export const StatusBadge = ({ status, isMockMode }: Props) => {
  // If in mock mode, override the status to show "Mock Mode"
  if (isMockMode) {
    return (
      <motion.div
        layout
        className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium uppercase tracking-wide text-purple-300"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Activity className="h-4 w-4" />
        Mock Mode
      </motion.div>
    );
  }

  const cfg = statusConfig[status];
  return (
    <motion.div
      layout
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${cfg.color}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {cfg.icon}
      {cfg.label}
    </motion.div>
  );
};

