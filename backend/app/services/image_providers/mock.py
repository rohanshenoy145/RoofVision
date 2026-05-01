"""Mock provider: returns the input image unchanged (pass-through)."""

from app.services.image_providers.base import ImageGenProvider, ImageGenRequest


class MockProvider(ImageGenProvider):
    id = "mock"

    def generate(self, req: ImageGenRequest) -> bytes:
        return req.image_bytes
