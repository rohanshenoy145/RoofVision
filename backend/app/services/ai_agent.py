"""
Simple AI agent wrapper around a configured image provider.

The agent owns the generation flow so backend services only call one class.
"""

from app.services.image_providers.base import ImageGenRequest
from app.services.image_providers.factory import get_image_provider


class AIAgent:
    """Thin agent layer for image generation."""

    def __init__(self) -> None:
        self.provider = get_image_provider()

    @property
    def id(self) -> str:
        return self.provider.id

    def generate_visualization(self, req: ImageGenRequest) -> bytes:
        return self.provider.generate(req)
