module.exports = {
  apps: [
    {
      name: "gpu-monitor-backend",
      script: "uvicorn",
      args: "app.main:app --host 0.0.0.0 --port 5000",
      cwd: "/opt/gpu-monitoring/backend",
      interpreter: "/opt/gpu-monitoring/backend/.venv/bin/python",
      env: {
        GPU_MONITOR_LOG_LEVEL: "INFO",
      },
    },
    {
      name: "gpu-monitor-frontend",
      script: "npx",
      args: "serve -s dist -l 3000",
      cwd: "/opt/gpu-monitoring/frontend",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};

