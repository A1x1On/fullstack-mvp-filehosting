# Backend — FastAPI File Manager

FastAPI backend for file storage and security scanning. Files are stored on disk and processed asynchronously by a Celery worker that extracts metadata, performs a threat scan, and creates alerts.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | FastAPI + Uvicorn |
| Database | PostgreSQL 16 (async via `asyncpg`, sync via `psycopg2-binary`) |
| ORM / migrations | SQLAlchemy 2.0 async + Alembic |
| Validation / config | Pydantic v2 + pydantic-settings |
| Background tasks | Celery 5 + Redis |
| File upload | python-multipart |
| Python | ≥ 3.14 |

## Project structure

```
backend/
├── src/
│   ├── app.py            # FastAPI app, middleware, router registration
│   ├── config.py         # Settings loaded from .env
│   ├── constants.py      # STORAGE_DIR and other constants
│   ├── database.py       # Async SQLAlchemy engine & session
│   ├── models/
│   │   ├── base.py       # Declarative base with UUID PK and timestamps
│   │   ├── file.py       # File model → table "files"
│   │   └── alert.py      # Alert model → table "alerts"
│   ├── schemas/
│   │   ├── base.py       # ListResponseSchema[T]
│   │   ├── file.py       # FileSchema, FileUpdateSchema, FileListCriteriaSchema
│   │   └── alert.py      # AlertSchema, AlertListCriteriaSchema
│   ├── routers/
│   │   ├── files.py      # /files endpoints
│   │   └── alerts.py     # /alerts endpoints
│   ├── services/
│   │   ├── file_service.py   # CRUD + disk I/O for files
│   │   └── alert_service.py  # CRUD for alerts
│   └── tasks/
│       ├── celery_app.py               # Celery app instance
│       ├── file_tasks/
│       │   ├── metadata.py             # extract_file_metadata task
│       │   └── threats.py              # scan_file_for_threats task (chain entry)
│       └── alert_tasks/
│           └── send.py                 # send_file_alert task (chain end)
├── migrations/           # Alembic migration scripts
├── storage/files/        # Uploaded files stored here (UUID-named)
├── Dockerfile
├── pyproject.toml
└── .env
```

## Setup (local, without Docker)

```bash
# 1. Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt
# or with uv:
uv sync

# 3. Configure environment
cp .env.example .env   # then edit with your values

# 4. Apply database migrations
alembic upgrade head

# 5. Start the API server
uvicorn src.app:app --reload --port 8000

# 6. Start the Celery worker (separate terminal)
celery -A src.tasks.celery_app worker -l info
```

## Setup (Docker Compose)

```bash
# From the repository root:
docker compose -f docker-compose.dev.yml up --build
```

Services started:

| Container | Description | Port |
|-----------|-------------|------|
| `backend` | FastAPI / Uvicorn | 8000 |
| `backend-worker` | Celery worker | — |
| `backend-db` | PostgreSQL 16 | 5433 |
| `backend-redis` | Redis | 6379 |
| `frontend` | Next.js | 3000 |

## API endpoints

### Files

| Method | Path | Description |
|--------|------|-------------|
| GET | `/files/` | List files (newest first, max 100) |
| POST | `/files/getByCriteria` | Paginated file list with total count |
| POST | `/files/` | Upload a new file (multipart/form-data) |
| GET | `/files/{file_id}` | Get file metadata by ID |
| PATCH | `/files/{file_id}` | Update file title |
| GET | `/files/{file_id}/download` | Download the stored file |
| DELETE | `/files/{file_id}` | Delete file (DB row + disk) |

#### `POST /files/` — upload

Form fields:

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Display title |
| `file` | binary | File content |

Response: `201 Created` with `FileSchema`.

After upload, `scan_file_for_threats` is enqueued (best-effort — if Redis is unavailable the upload still succeeds).

#### `POST /files/getByCriteria`

```json
{ "limit": 20, "offset": 0 }
```

Response: `{ "data": [...], "count": <total rows> }`

### Alerts

| Method | Path | Description |
|--------|------|-------------|
| GET | `/alerts/` | List alerts (newest first, max 100) |
| POST | `/alerts/getByCriteria` | Paginated alert list with total count |

Alerts are created automatically by the Celery pipeline after a file scan; there is no public create endpoint.

#### `POST /alerts/getByCriteria`

```json
{ "limit": 20, "offset": 0 }
```

### Other

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Returns `"Hello World!"` |

Interactive docs (when running):
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Background task pipeline

```
POST /files/  →  scan_file_for_threats  →  extract_file_metadata  →  send_file_alert
```

1. **`scan_file_for_threats`** — heuristic checks: suspicious extensions, file size > 10 MB, PDF MIME mismatch. Sets `scanStatus` on the file.
2. **`extract_file_metadata`** — reads extension, size, MIME type; text files get line / character counts; PDFs get an approximate page count.
3. **`send_file_alert`** — creates an `Alert` row (`critical` / `warning` / `info`) based on scan results.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_HOST` | `localhost` | PostgreSQL host |
| `POSTGRES_PORT` | `5433` | PostgreSQL port |
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_PASSWORD` | _(empty)_ | Database password |
| `POSTGRES_DB` | `postgres` | Database name |
| `POSTGRES_SSL` | `false` | Enable SSL (`true` / `false`) |
| `CELERY_BROKER_URL` | `redis://localhost:6379/0` | Celery broker + result backend (Redis) |

> The `.env` file on disk uses `REDIS_URL` as an alias — make sure `CELERY_BROKER_URL` is set if you run outside Docker.
