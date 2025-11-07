import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

type MetricSparklineProps = {
  data: number[];
  stroke?: string;
};

const SparklineTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="rounded-md bg-slate-900 px-3 py-1 text-sm text-slate-100 shadow-lg">
      {Math.round(value)}%
    </div>
  );
};

export const MetricSparkline = ({ data, stroke = "#22D3EE" }: MetricSparklineProps) => {
  const points = data.map((value, index) => ({ index, value }));
  const gradientId = useId();

  return (
    <ResponsiveContainer width="100%" height={60}>
      <AreaChart data={points} margin={{ top: 10, bottom: 0, left: 0, right: 0 }}>
        <defs>
          <linearGradient id={`spark-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.7} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={stroke}
          strokeWidth={2}
          fill={`url(#spark-${gradientId})`}
          isAnimationActive={false}
        />
        <Tooltip content={<SparklineTooltip />} cursor={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

