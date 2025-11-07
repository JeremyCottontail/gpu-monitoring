## Overview

- **Purpose**: Deliver a real-time GPU monitoring dashboard for a Debian-based AI workstation with dual NVIDIA GPUs.
- **Audience**: Internal tooling; no authentication required but must be secure-by-default when exposed behind Nginx.
- **Primary Value**: Replace manual SSH + `nvtop` checks with a modern web experience featuring live metrics and rich visual feedback.

## Goals

- Provide a live, auto-updating view of GPU performance metrics (utilization, memory, temperature, power, fan speed, active processes) for each installed GPU.
- Surface aggregated system metrics useful for GPU workload context (CPU usage, system memory, disk I/O, uptime) when available via the same telemetry layer.
- Deliver an intuitive UX with bold, gradient-forward styling reminiscent of AI/web3 landing pages.
- Keep architecture modular so the data source layer (pynvml vs. `nvidia-smi` vs. `nvtop`) is swappable without touching the frontend.

## Non-Goals

- User authentication, RBAC, or multi-tenant support.
- Historical storage, analytics, or alerting; only real-time streaming is in scope.
- GPU management operations (no job scheduling, throttling, or process termination).

## System Architecture

- **Data Pipeline**
  - Core telemetry collector in Python using `pynvml` (preferred) to poll GPU stats at a configurable interval (default 1s).
  - Implement a graceful fallback sequence: if `pynvml` is unavailable, parse `nvidia-smi`; as a last resort, run `nvtop` in batch mode and parse stdout.
  - Normalise metrics into a consistent JSON schema before emitting to the WebSocket layer.
- **API Layer**
  - FastAPI (preferred) or Flask backend exposing:
    - REST endpoint `/api/health` for uptime/health checks.
    - WebSocket endpoint `/ws/gpu` streaming telemetry payloads.
  - Serve static configuration endpoint `/api/config` for frontend settings (e.g., update interval, gradient presets) if required.
- **Frontend App**
  - React (TypeScript) SPA served separately (port 3000 in dev).
  - Establish WebSocket connection to backend for live updates.
  - Use Recharts for data visualisation; Tailwind for theming; Framer Motion for transitions.
- **Deployment Topology**
  - Nginx reverse proxy handling TLS (80/443) and routing to:
    - Backend service on internal port 5000.
    - Frontend static bundle (served by Nginx or a separate Node process during development).
  - Process managed via PM2 or systemd (document both; allow operator choice).

## Data Model

- **GPU Metric Payload** (`/ws/gpu` message)
  - `timestamp`: ISO-8601 string (UTC).
  - `gpus`: array of GPU objects where each includes:
    - `id`, `name`, `uuid`, `driverVersion`, `cudaVersion`.
    - `utilization` (percentage), `memoryUsed`, `memoryTotal` (MiB), `memoryFree`.
    - `temperature` (°C), `powerUsage` (W), `powerLimit`.
    - `fanSpeed` (percentage) if available.
    - `encoderUtilization`, `decoderUtilization` (optional, fallback-friendly).
    - `processes`: array with `pid`, `name`, `usedMemoryMiB`, optional `user`.
- **System Metric Payload** (optional block in same message)
  - `cpuUsage` (%), `memoryUsage` (%), `loadAverage` (1/5/15m), `uptime`, `diskUtilization` (if accessible without extra deps).
- Maintain consistent key casing (camelCase) for frontend binding.

## Backend Requirements

- Structure project with clear layers: `core/metrics`, `api/routes`, `services/websocket`.
- Implement dependency injection (FastAPI preferred) for telemetry provider to ease future testing.
- Ensure WebSocket broadcasts latest payload to all connected clients; support reconnection and heartbeat/ping.
- Expose configuration via environment variables or `.env` (e.g., `POLL_INTERVAL_MS`, `WS_BACKLOG`, `LOG_LEVEL`).
- Logging via Python `logging` module with JSON formatter for machine-friendly logs.
- Write unit tests for the telemetry provider logic (mock `pynvml`) and for JSON normalisation.

## Frontend Requirements

- Project bootstrapped with Vite + React + TypeScript (or Create React App with TypeScript if needed).
- Tailwind CSS configured with custom gradient palette and bold typography scale.
- Core pages/components:
  - `Dashboard`: hero section with current status banner, per-GPU cards, system summary.
  - `GpuCard`: displays metrics, live sparkline charts (Recharts `AreaChart` for utilization/memory), process list.
  - `TopNav` / `SideNav`: gradient background, brand/title, status indicators.
- WebSocket hook (`useGpuStream`) to manage connection lifecycle, handle retries, throttle updates when necessary.
- Apply Framer Motion for entrance animations, hover scaling on cards, and transitions between metric states.
- Responsiveness: mobile-first layout; stacked cards on narrow screens, grid on desktop.
- Dark-mode aesthetic by default with high-contrast typography and accent gradients.
- Use Lucide icons for status indicators (e.g., `Activity`, `Cpu`, `Thermometer`, `Server`).
- Integrate error/empty states when the backend is unreachable (display fallback message & reconnect CTA).

## Styling & UX Direction

- Visual language: neon gradients, glassmorphism overlays, subtle glows reminiscent of AI/web3 landing pages.
- Typography: bold headings, sans-serif display font (e.g., `Space Grotesk` or `Sora`), readable body text.
- Layout: hero banner with current aggregate GPU usage; per-GPU cards with large numeric badges and micro charts.
- Animations: use Framer Motion for smooth fade/slide; ensure reduced-motion preference is respected.
- Accessibility: maintain AA contrast ratios; keyboard navigable components; provide aria labels for charts and controls.

## Telemetry Sampling Strategy

- Default polling interval: 1 second. Allow configuration down to 250ms with warning in README about load.
- Debounce identical payloads to avoid redundant UI updates; send diff or throttle to 5 FPS maximum.
- Handle GPU hot-plug (detect changes in GPU count) and notify frontend of new/removed GPUs.

## Deployment and Ops

- Provide Dockerfiles for backend and frontend (multi-stage builds).
- Include `docker-compose.yml` for local dev (backend, frontend, optional nginx proxy).
- Production deployment guide:
  - Nginx config sample with reverse proxy, WebSocket upgrade headers, HTTP->HTTPS redirect.
  - systemd unit files or PM2 ecosystem config for backend service.
- Document environment setup (Python virtualenv, Node version, dependency installation).
- Provide scripts: `make start-dev`, `make lint`, `make test` (or npm/pip equivalents) for DX.

## Testing & QA

- Backend: pytest for telemetry provider, schema validation, WebSocket event tests (use FastAPI test client where applicable).
- Frontend: React Testing Library for critical components (Dashboard layout, GPU card rendering), snapshot tests for UI states if helpful.
- End-to-end: optional Cypress or Playwright test to verify live data render using mocked WebSocket server.
- Add GitHub Actions (or equivalent) CI workflow running lint + tests for both frontend and backend.

## Deliverables

- Backend service codebase meeting requirements above.
- Frontend SPA with production build pipeline.
- Deployment artifacts (Docker, Nginx config samples, process manager configs).
- Documentation: README covering setup, running locally, environment variables, and troubleshooting.
- Optional: design inspiration board or references captured in README for UI consistency.

