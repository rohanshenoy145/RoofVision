# RoofVision — Backend

Python FastAPI backend: REST API, SQLAlchemy (SQLite/PostgreSQL), Pydantic.

---

## Folder structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app, CORS, lifespan, router, rate-limit handler
│   ├── config.py            # Pydantic Settings (DATABASE_URL, CORS_ORIGINS, RATE_LIMIT_UPLOAD, …)
│   ├── database.py          # Engine, SessionLocal, Base, get_db
│   ├── rate_limit.py        # SlowAPI limiter (shared instance)
│   ├── api/
│   │   ├── __init__.py      # Aggregates all routers
│   │   ├── health.py        # GET /health, GET /health/ready
│   │   ├── manufacturers.py
│   │   ├── tiles.py
│   │   ├── colors.py
│   │   └── visualizations.py  # POST /visualizations, uploads
│   ├── models/              # SQLAlchemy ORM
│   │   ├── __init__.py
│   │   ├── manufacturer.py
│   │   ├── tile.py
│   │   ├── color.py
│   │   └── visualization.py   # Upload job: paths, status, generator, errors
│   ├── schemas/             # Pydantic request/response
│   │   ├── __init__.py
│   │   ├── manufacturer.py
│   │   ├── tile.py
│   │   ├── color.py
│   │   └── visualization.py
│   └── services/            # generator, ai_agent, image_providers
├── scripts/
│   ├── __init__.py
│   └── seed_data.py         # Sample manufacturers, tiles, colors
├── uploads/                 # Stored images (Option A: filesystem); .gitignore contents
├── requirements.txt
├── run.py                   # uvicorn entry point
├── .env.example
└── .env                     # Not committed; DATABASE_URL, etc.
```

---

## Models (SQLAlchemy)

**Catalog (waterfall):** Manufacturer → Tile → Color.

| Model | Table | Key columns |
|-------|-------|-------------|
| **Manufacturer** | `manufacturers` | id, name, slug, `material_type` (tile / shingle / metal) |
| **Tile** | `tiles` | id, manufacturer_id (FK), name, slug |
| **Color** | `colors` | id, tile_id (FK), name, hex_code, image_url |

**Phase 2 — uploads:**

| Model | Table | Key columns |
|-------|-------|-------------|
| **Visualization** | `visualizations` | id, image_path, manufacturer_id, tile_id, color_id, status, `result_path`, `error_message`, `generator`, created_at |

- Cascade: deleting a manufacturer deletes its tiles and their colors.
- `created_at` on all tables (optional for auditing).
- Uploaded files live in `backend/uploads/` (Option A); served at `GET /api/v1/uploads/{filename}` (StaticFiles mount in main.py).

---

## Config & database

- **config.py:** `Settings` from pydantic-settings; reads `.env` (e.g. `DATABASE_URL`, `IMAGE_GEN_*`, `CORS_ORIGINS`, `RATE_LIMIT_UPLOAD`). Unknown env keys are ignored so stale local vars do not crash startup.
- **database.py:** `create_engine(DATABASE_URL)`. For SQLite, `check_same_thread=False` for FastAPI.
- **main.py lifespan:** `Base.metadata.create_all(bind=engine)` so tables exist on startup (no Alembic required for dev).

---

## Running

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # default: SQLite
python -m scripts.seed_data
python run.py
```

- API: http://localhost:8001  
- Docs: http://localhost:8001/docs  
- Health: http://localhost:8001/api/v1/health  

See [API-REFERENCE.md](./API-REFERENCE.md) for endpoint details.
