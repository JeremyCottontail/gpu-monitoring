import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { motion } from "framer-motion";

type MetricChartProps = {
  data: number[];
  title: string;
  unit: string;
  color: string;
};

// Helper function to get color based on percentage
const getColorForPercentage = (percentage: number): string => {
  // Convert percentage to hue (0 = red, 120 = green)
  const hue = (100 - Math.min(100, Math.max(0, percentage))) * 1.2;
  return `hsl(${hue}, 100%, 50%)`;
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="rounded-md bg-slate-900 px-3 py-1 text-sm text-slate-100 shadow-lg">
      {Math.round(value)}% of 100%
    </div>
  );
};

export const MetricChart = ({ data, title, unit, color }: MetricChartProps) => {
  const points = data.map((value, index) => ({ index, value }));
  const gradientId = useId();

  // Get the latest value to determine color
  const latestValue = data.length > 0 ? data[data.length - 1] : 0;
  const chartColor = color || getColorForPercentage(latestValue);

  return (
    <motion.div
      className="glass-panel flex flex-col gap-3 p-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-slate-300">{title}</h3>
        <span className="text-xl font-semibold text-white">
          {data.length > 0 ? Math.round(data[data.length - 1]) : 0}{unit}
        </span>
      </div>
      <div className="h-24 md:h-20">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 5, bottom: 0, left: 0, right: 0 }}>
            <defs>
              <linearGradient id={`chart-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.7} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <YAxis domain={[0, 100]} hide />
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              strokeWidth={2}
              fill={`url(#chart-${gradientId})`}
              isAnimationActive={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};