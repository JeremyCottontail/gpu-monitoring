import type { GpuInfo, SystemMetrics, TelemetryPayload } from "@/types";

// Store persistent mock GPU data to prevent flickering
let persistentMockGpus: GpuInfo[] | null = null;
let persistentMockSystem: SystemMetrics | null = null;

// Generate mock GPU data for testing
export const generateMockGpuData = (count: number = 4): GpuInfo[] => {
  // If we already have persistent data, reuse it to prevent flickering
  if (persistentMockGpus && persistentMockGpus.length === count) {
    return persistentMockGpus.map(gpu => ({
      ...gpu,
      utilization: Math.floor(Math.random() * 100),
      memoryUsed: Math.floor(Math.random() * 10000),
      temperature: Math.floor(Math.random() * 50) + 30,
      powerUsage: Math.floor(Math.random() * 100) + 50,
      fanSpeed: Math.floor(Math.random() * 100),
      encoderUtilization: Math.floor(Math.random() * 100),
      decoderUtilization: Math.floor(Math.random() * 100),
      processes: gpu.processes.map(process => ({
        ...process,
        usedMemoryMiB: Math.floor(Math.random() * 2000)
      }))
    }));
  }

  // Create new mock data with exactly 4 GPUs (more realistic for mock mode)
  const newGpus = Array.from({ length: 4 }, (_, i) => {
    const processCount = Math.floor(Math.random() * 4) + 1; // 1-4 processes
    return {
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
      processes: Array.from({ length: processCount }, (_, j) => ({
        pid: 1000 + j,
        name: `process-${j}`,
        usedMemoryMiB: Math.floor(Math.random() * 2000),
        user: `user${j}`
      }))
    };
  });

  // Store for persistence
  persistentMockGpus = newGpus;
  return newGpus;
};

// Generate mock system metrics for testing
export const generateMockSystemMetrics = (): SystemMetrics => {
  // If we already have persistent system data, reuse it
  if (persistentMockSystem) {
    return {
      ...persistentMockSystem,
      cpuUsage: Math.floor(Math.random() * 100),
      memoryUsage: Math.floor(Math.random() * 100),
      memoryUsed: Math.floor(Math.random() * 8000),
      loadAverage: [Math.random() * 2, Math.random() * 2, Math.random() * 2],
      uptimeSeconds: persistentMockSystem.uptimeSeconds // Keep uptime constant
    };
  }

  const newSystemMetrics = {
    cpuUsage: Math.floor(Math.random() * 100),
    memoryUsage: Math.floor(Math.random() * 100),
    memoryUsed: Math.floor(Math.random() * 8000),
    memoryTotal: 16384,
    loadAverage: [Math.random() * 2, Math.random() * 2, Math.random() * 2],
    uptimeSeconds: Math.floor(Math.random() * 100000),
    hostname: "mock-hostname"
  };

  // Store for persistence
  persistentMockSystem = newSystemMetrics;
  return newSystemMetrics;
};

// Generate mock telemetry payload
export const generateMockTelemetry = (gpuCount?: number): TelemetryPayload => {
  return {
    timestamp: new Date().toISOString(),
    gpus: generateMockGpuData(gpuCount),
    system: generateMockSystemMetrics()
  };
};

// Reset mock data to force regeneration
export const resetMockData = () => {
  persistentMockGpus = null;
  persistentMockSystem = null;
};

// Generate mock historical data for charts
export const generateMockHistory = (length: number = 60): number[] => {
  return Array.from({ length }, () => Math.floor(Math.random() * 100));
};