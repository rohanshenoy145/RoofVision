# RoofVision — Backend

Python FastAPI backend: REST API, SQLAlchemy (SQLite/PostgreSQL), Pydantic.

---

## Folder structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app, CORS, lifespan, router
│   ├── config.py            # Pydantic Settings (DATABASE_URL, etc.)
│   ├── database.py          # Engine, SessionLocal, Base, get_db
│   ├── api/
│   │   ├── __init__.py      # Aggregates all routers
│   │   ├── health.py        # GET /health
│   │   ├── manufacturers.py
│   │   ├── tiles.py
│   │   ├── colors.py
│   │   └── visualizations.py  # Phase 2: POST /visualizations, file save
│   ├── models/              # SQLAlchemy ORM
│   │   ├── __init__.py
│   │   ├── manufacturer.py
│   │   ├── tile.py
│   │   ├── color.py
│   │   └── visualization.py   # Phase 2: image_path, manufacturer_id, tile_id, color_id, status
│   └── schemas/             # Pydantic request/response
│       ├── __init__.py
│       ├── manufacturer.py
│       ├── tile.py
│       ├── color.py
│       └── visualization.py
├── scripts/
│   ├── __init__.py
│   └── seed_data.py         # Sample manufacturers, tiles, colors
├── uploads/                 # Phase 2: stored images (Option A: filesystem); .gitignore contents
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
| **Manufacturer** | `manufacturers` | id, name, slug |
| **Tile** | `tiles` | id, manufacturer_id (FK), name, slug |
| **Color** | `colors` | id, tile_id (FK), name, hex_code, image_url |

**Phase 2 — uploads:**

| Model | Table | Key columns |
|-------|-------|-------------|
| **Visualization** | `visualizations` | id, image_path (filename in uploads/), manufacturer_id, tile_id, color_id, status (pending/…), created_at |

- Cascade: deleting a manufacturer deletes its tiles and their colors.
- `created_at` on all tables (optional for auditing).
- Uploaded files live in `backend/uploads/` (Option A); served at `GET /api/v1/uploads/{filename}` (StaticFiles mount in main.py).

---

## Config & database

- **config.py:** `Settings` from pydantic-settings; reads `.env` (e.g. `DATABASE_URL`).
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
