# QWEN.md

## Project Overview

This is a real-time GPU monitoring dashboard designed for AI workstations and high-performance computing environments. The system provides live telemetry streaming of GPU metrics with sub-second updates, supporting multiple GPUs and comprehensive monitoring capabilities.

## Architecture

The system follows a client-server architecture with a real-time streaming data pipeline:

- **Backend**: Built with FastAPI, serving as the telemetry collector and WebSocket server
- **Frontend**: Built with React + TypeScript, providing a responsive dashboard UI
- **Telemetry Providers**: Supports multiple methods for collecting GPU metrics:
  - PyNVML (primary): Direct Python bindings to NVIDIA Management Library
  - nvidia-smi (fallback): Parses JSON output from NVIDIA System Management Interface
  - nvtop (last resort): Parses output from nvtop monitoring tool

## Key Features

- Real-time monitoring with WebSocket streaming (sub-second updates)
- Multi-GPU support with individual GPU cards
- Comprehensive metrics: utilization, memory, temperature, power consumption, fan speed, encoder/decoder usage
- Process tracking showing active GPU processes with PID, memory usage, and user information
- System metrics: CPU, memory, load average, and system uptime
- Historical visualization with 60-second rolling history and sparkline charts
- Docker support for easy deployment
- Production-ready configurations for systemd, PM2, and Nginx

## Technology Stack

### Backend
- Framework: FastAPI (high-performance async API)
- WebSocket: Starlette WebSocket
- Telemetry: PyNVML / nvidia-smi / nvtop
- System Metrics: psutil
- Testing: pytest

### Frontend
- Framework: React 18
- Language: TypeScript
- Build Tool: Vite
- Styling: Tailwind CSS
- Charts: Recharts
- Animations: Framer Motion
- Icons: Lucide React

## Building and Running

### Docker Compose (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd gpu-monitoring

# Build and start all services
docker compose up --build

# Access the dashboard
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

### Local Development

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Using Make
```bash
# Install dependencies
make install-backend
make install-frontend

# Start services (in separate terminals)
make start-backend
make start-frontend
```

## Configuration

### Environment Variables
The backend can be configured via environment variables (prefixed with `GPU_MONITOR_`) or a `.env` file:

| Variable | Default | Description |
|----------|---------|-------------|
| `GPU_MONITOR_POLL_INTERVAL_MS` | `1000` | Telemetry polling interval in milliseconds |
| `GPU_MONITOR_WS_MAX_RATE_HZ` | `5` | Maximum WebSocket broadcast frequency |
| `GPU_MONITOR_LOG_LEVEL` | `INFO` | Python logging level |
| `GPU_MONITOR_ENABLE_SYSTEM_METRICS` | `true` | Include system-level metrics |
| `GPU_MONITOR_TELEMETRY_PROVIDER` | `null` | Force specific provider |

### Telemetry Provider Selection
1. **PyNVML** (Preferred): Rich metrics, process enumeration
2. **nvidia-smi** (Fallback): Basic metrics, no process details
3. **nvtop** (Last Resort): Parses nvtop JSON output

## Testing

### Backend Tests
```bash
cd backend
source .venv/bin/activate
pytest
```

### Frontend Linting
```bash
cd frontend
npm run lint
```

## Deployment

### Production Deployment Options

#### Docker Compose
```bash
docker compose -f docker-compose.yml build
docker compose up -d
```

#### Systemd Service
```bash
sudo cp deployment/systemd/gpu-monitor-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable gpu-monitor-backend
sudo systemctl start gpu-monitor-backend
```

#### PM2 Process Manager
```bash
npm install -g pm2
pm2 start deployment/pm2/ecosystem.config.cjs
pm2 save
pm2 startup
```

## Development Conventions

- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting
- Use Pydantic for configuration management
- Leverage FastAPI's async capabilities for performance
- Use React hooks for state management in frontend
- Implement TypeScript for type safety

## Graph Scaling Fix

Fixed an issue where GPU utilization and memory usage graphs showed incorrect scaling. Previously, when showing low values (e.g., 2%), the graphs would appear to show high percentages because Recharts automatically scaled the Y-axis to fit the data range.

**Changes Made:**
1. Modified `MetricSparkline.tsx` to use a fixed Y-axis domain of [0, 100] to ensure consistent scaling
2. Enhanced the tooltip to clarify that values are percentages of 100%
3. Added bounds checking for utilization values to ensure they stay between 0-100%
4. Updated labels in `GpuCard.tsx` to clarify the 0-100% range for historical data

## API Reference

### REST Endpoints
- `GET /api/health` - Health check endpoint
- `GET /api/config` - Get current configuration

### WebSocket Endpoint
- `WS /ws/gpu` - Real-time telemetry stream with GPU metrics and system stats

## Troubleshooting

Common issues include:
- Backend won't start due to missing NVIDIA drivers or PyNVML
- WebSocket connection failures
- No GPUs detected
- High CPU usage
- Permission errors

Debugging tips:
- Enable debug logging with `GPU_MONITOR_LOG_LEVEL=DEBUG`
- Verify NVIDIA drivers with `nvidia-smi`
- Check that `nvidia-smi` is in PATH
- For Docker, ensure GPU passthrough is configured correctly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License