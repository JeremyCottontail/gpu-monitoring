export const formatPercent = (value?: number | null) => {
  if (value === undefined || value === null) return "--";
  return `${Math.round(value)}%`;
};

export const formatTemperature = (value?: number | null) => {
  if (value === undefined || value === null) return "--";
  return `${Math.round(value)}°C`;
};

export const formatPower = (value?: number | null) => {
  if (value === undefined || value === null) return "--";
  return `${value.toFixed(1)} W`;
};

export const formatMemory = (value?: number | null) => {
  if (value === undefined || value === null) return "--";
  return `${value.toFixed(1)} MiB`;
};

export const formatUptime = (seconds?: number | null) => {
  if (!seconds && seconds !== 0) return "--";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(" ");
};

