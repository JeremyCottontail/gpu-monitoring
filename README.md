# GPU Monitoring Dashboard

Real-time GPU monitoring stack for AI workstations. Backend FastAPI service streams telemetry from NVIDIA GPUs via WebSockets. React + Tailwind frontend renders a neon-glass dashboard with live charts.

## Project Structure

- `backend/`: FastAPI service with telemetry providers (`pynvml`, `nvidia-smi`, `nvtop`).
- `frontend/`: Vite + React + Tailwind UI consuming live telemetry via WebSocket.
- `deployment/`: Nginx reverse-proxy snippets, PM2 and systemd configs.
- `docker-compose.yml`: Compose file for local container orchestration.

## Prerequisites

- Python 3.10+
- Node.js 18+
- NVIDIA drivers + NVML (`nvidia-smi`) available on host
- Optional: `pynvml`, `nvtop`, `psutil`

## Local Development

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

Environment variables (see `GPU_MONITOR_*` in `app/config.py`) can be set via shell or `.env`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite dev server proxies `/api` and `/ws` to the backend.

## Testing

```bash
cd backend
source .venv/bin/activate
pytest

cd ../frontend
npm run lint
```

## Docker

Build and run both services:

```bash
docker compose up --build
```

Frontend served on `http://localhost:3000`, backend on `http://localhost:5000`.

## Deployment Notes

- Use `deployment/nginx/gpu-monitor.conf` as a template for TLS-enabled reverse proxy.
- `deployment/systemd/gpu-monitor-backend.service` launches backend under systemd; adjust user/paths.
- `deployment/pm2/ecosystem.config.cjs` for PM2-managed processes.

## Telemetry Providers

1. `pynvml` (preferred) – rich metrics, process enumeration.
2. `nvidia-smi` fallback – basic stats without process detail.
3. `nvtop` fallback – parses `nvtop --json` output.

Set `GPU_MONITOR_TELEMETRY_PROVIDER` to force a provider or leave unset for auto-detection.

## Frontend Styling

- Tailwind with custom gradients (`tailwind.config.cjs`).
- Recharts for sparklines, Framer Motion for transitions.
- Dark mode by default with neon accents.

## Troubleshooting

- Ensure `nvidia-smi` runs without sudo for the service user.
- Install `nvtop` >= 3.0 for JSON output when relying on fallback.
- WebSocket connection issues: verify Nginx config includes `Upgrade`/`Connection` headers.

