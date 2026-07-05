from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    DATABASE_URL: str = "postgresql://user:password@localhost:5432/roofvision"
    DEBUG: bool = False

    # --- Image generation (Gemini API; see docs/IMAGE-GEN-API.md) ---
    IMAGE_GEN_PROVIDER: str = "mock"
    IMAGE_GEN_API_KEY: str = ""
    IMAGE_GEN_MODEL: str = "gemini-3.1-flash-image-preview"
    IMAGE_GEN_TIMEOUT_SECONDS: int = 180
    IMAGE_GEN_MAX_RETRIES: int = 2
    IMAGE_GEN_RETRY_BACKOFF_SECONDS: float = 1.5

    # --- CORS (browser clients). Empty = allow all origins (dev only). ---
    # Example: CORS_ORIGINS=http://localhost:8090,https://app.yourdomain.com
    CORS_ORIGINS: str = ""

    # SlowAPI limit for POST /visualizations (per client IP). Example: "20/minute"
    RATE_LIMIT_UPLOAD: str = "30/minute"

    # --- Environment ---
    ENVIRONMENT: str = "development"  # development | staging | production

    # --- Object storage (local | gcs | s3). See docs/DEPLOY.md ---
    STORAGE_BACKEND: str = "local"
    # Optional CDN or bucket public URL prefix (overrides default URL shape)
    STORAGE_PUBLIC_BASE_URL: str = ""
    GCS_BUCKET: str = ""
    GCS_PROJECT: str = ""
    GCS_CREDENTIALS_PATH: str = ""
    S3_BUCKET: str = ""
    AWS_REGION: str = "us-east-1"
    S3_ENDPOINT_URL: str = ""

    # --- Observability (optional) ---
    SENTRY_DSN: str = ""
    SENTRY_TRACES_SAMPLE_RATE: float = 0.1

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def cors_origin_list(self) -> list[str]:
        raw = (self.CORS_ORIGINS or "").strip()
        if not raw:
            return ["*"]
        parts = [p.strip() for p in raw.split(",") if p.strip()]
        return parts if parts else ["*"]

    @property
    def is_sqlite(self) -> bool:
        return "sqlite" in (self.DATABASE_URL or "").lower()

    @property
    def use_local_static_files(self) -> bool:
        return (self.STORAGE_BACKEND or "local").lower().strip() == "local"


settings = Settings()
