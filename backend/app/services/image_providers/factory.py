"""Resolve the active image provider from application settings."""
import logging

from app.config import settings
from app.services.image_providers.base import ImageGenProvider
from app.services.image_providers.gemini_provider import GeminiProvider
from app.services.image_providers.mock import MockProvider

logger = logging.getLogger(__name__)


def get_image_provider() -> ImageGenProvider:
    """Return configured provider; fallback to mock on misconfiguration."""
    provider_name = (settings.IMAGE_GEN_PROVIDER or "mock").lower().strip()
    api_key = (settings.IMAGE_GEN_API_KEY or "").strip()

    if provider_name == "mock":
        return MockProvider()

    if not api_key:
        logger.info("IMAGE_GEN_PROVIDER=%s but no API key; using mock", provider_name)
        return MockProvider()

    if provider_name == "gemini":
        model = (settings.IMAGE_GEN_MODEL or "gemini-3.1-flash-image-preview").strip()
        timeout = settings.IMAGE_GEN_TIMEOUT_SECONDS
        return GeminiProvider(
            api_key=api_key,
            model=model,
            timeout_seconds=timeout,
            max_retries=settings.IMAGE_GEN_MAX_RETRIES,
            retry_backoff_seconds=settings.IMAGE_GEN_RETRY_BACKOFF_SECONDS,
        )

    logger.warning("Unknown IMAGE_GEN_PROVIDER=%s; using mock", provider_name)
    return MockProvider()
