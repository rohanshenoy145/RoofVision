from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import router as api_router
from app.api.visualizations import UPLOADS_DIR
from app.database import Base, engine

# Import models so they are registered with Base before create_all
from app.models import Manufacturer, Tile, Color, Visualization  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables and uploads directory on startup."""
    Base.metadata.create_all(bind=engine)
    # Phase 3: add columns to existing visualizations table if missing (SQLite doesn't alter on create_all)
    from sqlalchemy import text
    with engine.connect() as conn:
        for col, typ in [("result_path", "VARCHAR(255)"), ("error_message", "VARCHAR(500)"), ("generator", "VARCHAR(50)")]:
            try:
                conn.execute(text(f"ALTER TABLE visualizations ADD COLUMN {col} {typ}"))
                conn.commit()
            except Exception:
                conn.rollback()
    with engine.connect() as conn2:
        try:
            conn2.execute(text("ALTER TABLE manufacturers ADD COLUMN material_type VARCHAR(50)"))
            conn2.commit()
        except Exception:
            conn2.rollback()
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(
    lifespan=lifespan,
    title="RoofVision API",
    version="0.1.0",
    description="API for RoofVision roof visualization app",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads first so /api/v1/uploads/{filename} is served before the API router
app.mount("/api/v1/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
app.include_router(api_router, prefix="/api/v1")
