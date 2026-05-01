from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    DATABASE_URL: str = "postgresql://user:password@localhost:5432/roofvision"
    DEBUG: bool = False

    # --- Image generation (Gemini API; see docs/IMAGE-GEN-API.md) ---
    # mock = pass input through as "result" (no external call)
    # gemini = Gemini image model (requires IMAGE_GEN_API_KEY)
    IMAGE_GEN_PROVIDER: str = "mock"
    IMAGE_GEN_API_KEY: str = ""
    # Gemini model id (change as Gemini image models evolve)
    IMAGE_GEN_MODEL: str = "gemini-3.1-flash-image-preview"
    IMAGE_GEN_TIMEOUT_SECONDS: int = 180
    IMAGE_GEN_MAX_RETRIES: int = 2
    IMAGE_GEN_RETRY_BACKOFF_SECONDS: float = 1.5

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
