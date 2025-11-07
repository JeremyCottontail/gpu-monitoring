PYTHON ?= python3
NODE ?= npm
VENV ?= .venv
VENV_BIN ?= $(VENV)/bin

.PHONY: install-backend install-frontend start-backend start-frontend lint test

install-backend:
	cd backend && $(PYTHON) -m venv $(VENV)
	cd backend && $(VENV_BIN)/pip install -r requirements.txt

install-frontend:
	cd frontend && $(NODE) install

start-backend:
	cd backend && $(VENV_BIN)/uvicorn app.main:app --reload --host 0.0.0.0 --port 5000

start-frontend:
	cd frontend && $(NODE) run dev

lint:
	cd backend && $(VENV_BIN)/python -m compileall app
	cd frontend && $(NODE) run lint

test:
	cd backend && $(VENV_BIN)/pytest

