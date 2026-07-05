import logging
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api import router as api_router
from app.config import settings
from app.database import Base, engine
from app.rate_limit import limiter
from app.services.storage import UPLOADS_DIR, get_storage

# Import models so they are registered with Base before create_all
from app.models import Manufacturer, Tile, Color, Visualization  # noqa: F401

logger = logging.getLogger(__name__)


def _init_sentry() -> None:
    dsn = (settings.SENTRY_DSN or "").strip()
    if not dsn:
        return
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.starlette import StarletteIntegration

        sentry_sdk.init(
            dsn=dsn,
            environment=settings.ENVIRONMENT,
            traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE,
            integrations=[StarletteIntegration(), FastApiIntegration()],
        )
        logger.info("Sentry initialized for environment=%s", settings.ENVIRONMENT)
    except ImportError:
        logger.warning("SENTRY_DSN set but sentry-sdk not installed")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables and local uploads directory on startup."""
    _init_sentry()
    get_storage()

    if settings.is_sqlite:
        Base.metadata.create_all(bind=engine)
        from sqlalchemy import text

        with engine.connect() as conn:
            for col, typ in [
                ("result_path", "VARCHAR(255)"),
                ("error_message", "VARCHAR(500)"),
                ("generator", "VARCHAR(50)"),
            ]:
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
    else:
        logger.info("Non-SQLite DATABASE_URL — run `alembic upgrade head` for schema migrations")

    if settings.use_local_static_files:
        UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(
    lifespan=lifespan,
    title="RoofVision API",
    version="0.1.0",
    description="API for RoofVision roof visualization app",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


_origins = settings.cors_origin_list
_cors_wildcard = len(_origins) == 1 and _origins[0] == "*"
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=not _cors_wildcard,
    allow_methods=["*"],
    allow_headers=["*"],
)

if settings.use_local_static_files:
    app.mount("/api/v1/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.include_router(api_router, prefix="/api/v1")
