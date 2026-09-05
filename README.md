# Nepal Stock Market Intelligence Application

A modular monolith web application for collecting, processing, categorizing, analyzing, and visualizing Nepal Stock Exchange (NEPSE) market data and news.

---

## Key Features

- **Automated Web Crawlers**: Modular adapters for `MeroLagani`, `ShareSansar`, `NepseAlpha`, and `Bizmandu` with rate limits, retries, and deduplication.
- **Explainable News Categorization**: Multi-label regex, company symbol, name, and alias matching with confidence scoring and an Analyst correction portal.
- **Financial Market Analytics**:
  - **VWAP**: Volume-Weighted Average Price from floorsheet transactions (with typical price fallback).
  - **Order Flow Pressure**: Normalized buy vs. sell broker pressure score.
  - **Volume Anomaly Detection**: Automated flagging of turnover spikes ($\ge$ 2x 30-day baseline average).
  - **Broker Breakdown**: Top buyer & seller broker concentration analysis.
  - **News Impact Analysis**: Tracking next-day returns following news events.
- **Realtime Dashboard**: Live WebSocket event feed for crawl updates and market data ingestion.
- **Role-Based Access Control (RBAC)**: Backend-enforced roles (`Admin`, `Analyst`, `Viewer`).
- **Data Export**: JSON and CSV export endpoints for model retraining and external analysis.

---

## Technology Stack

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, Alembic, Pydantic V2, Celery, Redis, PostgreSQL / SQLite.
- **Frontend**: React 18, TypeScript, Vite, React Router, TanStack Query, Recharts.
- **Deployment**: Docker & Docker Compose.

---

## Quick Start (Docker Compose)

Start the entire application (PostgreSQL, Redis, Backend, Celery Worker, Celery Beat, Frontend) with a single command:

```bash
docker-compose up --build
```

Access points:
- **Frontend Dashboard**: `http://localhost:8080` (or `http://localhost:5173` in dev)
- **FastAPI OpenAPI Documentation**: `http://localhost:8000/api/v1/docs`

---


## Local Development (Without Docker)

### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Seed initial database (users, 10 companies, 30 days prices, floorsheet, news)
python seed_data.py

# Run FastAPI dev server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Run Backend Tests
```bash
cd backend
source venv/bin/activate
PYTHONPATH=. pytest tests/
```

---

## Project Structure

```
stock-market-intelligence/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # REST & WebSocket Endpoints
│   │   ├── core/            # Security, Permissions, Exceptions
│   │   ├── crawlers/        # MeroLagani, ShareSansar, NepseAlpha, Bizmandu
│   │   ├── models/          # SQLAlchemy ORM Models
│   │   ├── repositories/    # Database Access Functions
│   │   ├── schemas/         # Pydantic Schemas
│   │   ├── services/        # Business Logic & Financial Formulas
│   │   ├── tasks/           # Celery Async Tasks & Beat Scheduler
│   │   └── websocket/       # Realtime WebSocket Connection Manager
│   ├── tests/               # Pytest Unit & Integration Tests
│   └── seed_data.py         # Demo Data Seeder CLI
├── frontend/
│   ├── src/
│   │   ├── app/             # Router & Providers
│   │   ├── components/      # Layout, Common, Charts, Tables
│   │   ├── pages/           # Dashboard, Detail, Comparison, News, Crawls, Corrections, Users
│   │   ├── lib/             # API client, WebSocket client, Formatters
│   │   └── styles/          # Classic Professional Design System
└── docs/
    ├── architecture.md      # System Design & Data Flow
    └── findings-summary.md  # Empirical Data Findings & Examples
```
