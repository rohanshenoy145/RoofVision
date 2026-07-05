"""Local filesystem storage (default for dev)."""
import shutil
from pathlib import Path

from app.services.storage.base import StorageBackend

UPLOADS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "uploads"


class LocalStorageBackend(StorageBackend):
    def __init__(self, uploads_dir: Path | None = None, public_base_url: str = ""):
        self.uploads_dir = uploads_dir or UPLOADS_DIR
        self.uploads_dir.mkdir(parents=True, exist_ok=True)
        base = (public_base_url or "").rstrip("/")
        self.public_base_url = base

    def _path(self, key: str) -> Path:
        return self.uploads_dir / key

    def save(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        path = self._path(key)
        path.write_bytes(data)
        return key

    def read_bytes(self, key: str) -> bytes:
        return self._path(key).read_bytes()

    def exists(self, key: str) -> bool:
        return self._path(key).is_file()

    def copy(self, src_key: str, dest_key: str) -> str:
        src = self._path(src_key)
        dest = self._path(dest_key)
        if not src.exists():
            raise FileNotFoundError(f"Source not found: {src_key}")
        shutil.copy2(src, dest)
        return dest_key

    def public_url(self, key: str) -> str:
        if self.public_base_url:
            return f"{self.public_base_url}/{key}"
        return f"/api/v1/uploads/{key}"
