from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    DATABASE_URL: str = "postgresql://user:password@localhost:5432/roofvision"
    DEBUG: bool = False

    class Config:
        env_file = ".env"


settings = Settings()
