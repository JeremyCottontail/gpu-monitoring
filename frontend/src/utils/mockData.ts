import type { GpuInfo, SystemMetrics, TelemetryPayload } from "@/types";

// Generate mock GPU data for testing
export const generateMockGpuData = (count: number = 2): GpuInfo[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    uuid: `GPU-${i}-mock-uuid`,
    name: `Mock GPU ${i}`,
    driverVersion: "470.82.01",
    cudaVersion: "11.4",
    utilization: Math.floor(Math.random() * 100),
    memoryUsed: Math.floor(Math.random() * 10000),
    memoryTotal: 16384,
    memoryFree: 6384,
    temperature: Math.floor(Math.random() * 50) + 30,
    powerUsage: Math.floor(Math.random() * 100) + 50,
    powerLimit: 250,
    fanSpeed: Math.floor(Math.random() * 100),
    encoderUtilization: Math.floor(Math.random() * 100),
    decoderUtilization: Math.floor(Math.random() * 100),
    processes: Array.from({ length: Math.floor(Math.random() * 5) }, (_, j) => ({
      pid: 1000 + j,
      name: `process-${j}`,
      usedMemoryMiB: Math.floor(Math.random() * 2000),
      user: `user${j}`
    }))
  }));
};

// Generate mock system metrics for testing
export const generateMockSystemMetrics = (): SystemMetrics => {
  return {
    cpuUsage: Math.floor(Math.random() * 100),
    memoryUsage: Math.floor(Math.random() * 100),
    memoryUsed: Math.floor(Math.random() * 8000),
    memoryTotal: 16384,
    loadAverage: [Math.random() * 2, Math.random() * 2, Math.random() * 2],
    uptimeSeconds: Math.floor(Math.random() * 100000),
    hostname: "mock-hostname"
  };
};

// Generate mock telemetry payload
export const generateMockTelemetry = (gpuCount: number = 2): TelemetryPayload => {
  return {
    timestamp: new Date().toISOString(),
    gpus: generateMockGpuData(gpuCount),
    system: generateMockSystemMetrics()
  };
};

// Generate mock historical data for charts
export const generateMockHistory = (length: number = 60): number[] => {
  return Array.from({ length }, () => Math.floor(Math.random() * 100));
};