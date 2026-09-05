# System Architecture & Design Document

## 1. Executive Summary
The **Nepal Stock Market Intelligence Application** is built as a production-ready **Modular Monolith** designed to collect, categorize, analyze, and present market data and news from the Nepal Stock Exchange (NEPSE).

It integrates asynchronous web crawlers for major financial news portals (`MeroLagani`, `ShareSansar`, `NepseAlpha`, `Bizmandu`), multi-label rule-based news categorization, financial metric calculation (VWAP, Buy/Sell Pressure, Volume Anomaly detection, Broker Breakdown), WebSocket real-time events, and Role-Based Access Control (RBAC).

---

## 2. Technical Stack Overview
- **Backend Framework**: Python 3.11+, FastAPI (REST API + WebSockets), SQLAlchemy 2.0 ORM, Pydantic V2 schemas.
- **Database & Storage**: PostgreSQL (relational storage with unique constraints and foreign keys), SQLite for unit testing.
- **Background Tasks & Scheduling**: Celery workers with Redis as message broker and result backend. Celery Beat for cron-scheduled crawling.
- **Frontend Stack**: React 18 with TypeScript, Vite, React Router, TanStack Query (React Query), Recharts charting library.
- **Authentication**: JWT authentication with server-side RBAC dependencies (`Admin`, `Analyst`, `Viewer`).

---

## 3. Data Layer & Schema Design

```
+----------------+      +-----------------------+      +--------------------+
|     users      |      |       companies       |      |    daily_prices    |
+----------------+      +-----------------------+      +--------------------+
| id (PK)        |      | id (PK)               |      | id (PK)            |
| name           |      | symbol (UNIQUE)       |<---->| company_id (FK)    |
| email (UNIQUE) |      | name                  |      | trading_date       |
| password_hash  |      | sector                |      | open, high, low    |
| role           |      +-----------------------+      | close, volume      |
+----------------+                  ^                  +--------------------+
                                    |
                        +-----------+-----------+
                        |                       |
            +-----------------------+   +------------------------+
            |   news_company_tags   |   |   analysis_snapshots   |
            +-----------------------+   +------------------------+
            | article_id (FK)       |   | company_id (FK)        |
            | company_id (FK)       |   | analysis_date          |
            | confidence, method    |   | vwap, pressure_score   |
            +-----------------------+   | volume_anomaly         |
                                        +------------------------+
```

---

## 4. Crawling & Multi-Label Categorization Flow

1. **Scheduled Execution**: Celery Beat schedules crawling jobs per portal.
2. **Crawler Adapters**: Adapters derive from `BaseCrawler`, respecting robots.txt guidelines, exponential backoff retries, and URL canonicalization deduplication.
3. **Ingestion & Deduplication**: Canonical URLs act as strict primary keys. Duplicate articles are silently skipped.
4. **Explainable Categorization**:
   - `exact_symbol`: Matched exact symbol (e.g. `NABIL`). Confidence = 0.85-0.95.
   - `exact_name`: Matched company name (e.g. `Nabil Bank Limited`). Confidence = 0.75-0.90.
   - `alias_match`: Matched key alias stem. Confidence = 0.60.
5. **Analyst Correction Interface**: Analysts override false tags. Override events are persisted to `news_corrections` and tagged with `method="manual_correction"` and `confidence=1.0`.

---

## 5. Financial Analysis Algorithms

### VWAP (Volume Weighted Average Price)
Calculated from floorsheet transactions:
$$\text{VWAP} = \frac{\sum (\text{Rate} \times \text{Quantity})}{\sum \text{Quantity}}$$
If floorsheet is unavailable, a typical-price approximation is applied: $\text{VWAP}_{\text{approx}} = \frac{\text{High} + \text{Low} + \text{Close}}{3}$.

### Buy/Sell Order Flow Pressure
Calculated from buyer/seller broker transaction logs:
$$\text{Pressure Score} = \frac{\text{Buy Quantity} - \text{Sell Quantity}}{\text{Buy Quantity} + \text{Sell Quantity}}$$

### Volume Anomaly Detection
Flags anomalies when current day trading volume satisfies:
$$\text{Volume}_{\text{today}} \ge 2.0 \times \text{RollingAverage}_{\text{30d}}$$

---

## 6. Realtime Updates (WebSocket)
The WebSocket endpoint at `/api/v1/ws/dashboard` broadcasts JSON events to all active dashboard clients upon crawl status changes (`crawl_start`, `crawl_complete`, `crawl_failed`) and new market data ingestion.
