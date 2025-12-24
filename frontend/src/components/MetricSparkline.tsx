import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";

type MetricSparklineProps = {
  data: number[];
  stroke?: string;
  title?: string;
};

// Helper function to get color based on percentage
const getColorForPercentage = (percentage: number): string => {
  // Convert percentage to hue (0 = red, 120 = green)
  const hue = (100 - Math.min(100, Math.max(0, percentage))) * 1.2;
  return `hsl(${hue}, 100%, 50%)`;
};

const SparklineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="rounded-md bg-slate-900 px-3 py-1 text-sm text-slate-100 shadow-lg">
      {Math.round(value)}% of 100%
    </div>
  );
};

export const MetricSparkline = ({ data, stroke = "#22D3EE", title }: MetricSparklineProps) => {
  const points = data.map((value, index) => ({ index, value }));
  const gradientId = useId();

  // Get the latest value to determine color
  const latestValue = data.length > 0 ? data[data.length - 1] : 0;
  const color = getColorForPercentage(latestValue);

  return (
    <div className="flex flex-col gap-2">
      {title && (
        <div className="text-sm font-medium text-slate-300">{title}</div>
      )}
      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 5, bottom: 0, left: 0, right: 0 }}>
            <defs>
              <linearGradient id={`spark-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.7} />
                <stop offset="100%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <YAxis domain={[0, 100]} hide />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#spark-${gradientId})`}
              isAnimationActive={false}
            />
            <Tooltip content={<SparklineTooltip />} cursor={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

