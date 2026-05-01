"""
Abstract interface for image-to-image generation.

Providers take an input image + text prompt and return generated image bytes (PNG/JPEG).
Adding a new backend = new subclass + register in factory.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class ImageGenRequest:
    """Normalized input for any img2img-capable provider."""

    image_bytes: bytes
    prompt: str
    negative_prompt: str = "blurry, low quality, distorted"
    strength: float = 0.45
    steps: int = 20
    width: int = 512
    height: int = 512
    extra: dict = field(default_factory=dict)  # provider-specific overrides


class ImageGenProvider(ABC):
    """Contract: image in → image bytes out."""

    id: str  # stored on Visualization.generator (e.g. "gemini", "mock")

    @abstractmethod
    def generate(self, req: ImageGenRequest) -> bytes:
        """Return raw image bytes (PNG preferred)."""
        raise NotImplementedError
