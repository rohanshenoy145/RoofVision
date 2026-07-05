"""Object storage abstraction for uploads and generated results."""
from abc import ABC, abstractmethod


class StorageBackend(ABC):
    """Save and resolve public URLs for visualization images."""

    @abstractmethod
    def save(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        """Persist bytes under key; returns key."""

    @abstractmethod
    def read_bytes(self, key: str) -> bytes:
        """Load object bytes."""

    @abstractmethod
    def exists(self, key: str) -> bool:
        """Return True if key exists."""

    @abstractmethod
    def copy(self, src_key: str, dest_key: str) -> str:
        """Copy src to dest; returns dest key."""

    @abstractmethod
    def public_url(self, key: str) -> str:
        """URL or path clients use to fetch the object."""
