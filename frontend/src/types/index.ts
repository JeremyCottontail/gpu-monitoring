export type GpuProcess = {
  pid: number | null;
  name?: string | null;
  usedMemoryMiB?: number | null;
  user?: string | null;
};

export type GpuInfo = {
  id: number;
  uuid?: string;
  name?: string;
  driverVersion?: string;
  cudaVersion?: number | string | null;
  utilization?: number | null;
  memoryUsed?: number | null;
  memoryTotal?: number | null;
  memoryFree?: number | null;
  temperature?: number | null;
  powerUsage?: number | null;
  powerLimit?: number | null;
  fanSpeed?: number | null;
  encoderUtilization?: number | null;
  decoderUtilization?: number | null;
  processes: GpuProcess[];
};

export type SystemMetrics = {
  cpuUsage?: number;
  memoryUsage?: number;
  memoryUsed?: number;
  memoryTotal?: number;
  loadAverage?: number[];
  uptimeSeconds?: number;
  hostname?: string;
};

export type TelemetryPayload = {
  timestamp: string;
  gpus: GpuInfo[];
  system?: SystemMetrics;
};

export type StreamStatus = "connecting" | "online" | "offline" | "error";

