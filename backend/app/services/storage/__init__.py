"""Storage factory — local filesystem (dev) or GCS/S3 (production)."""
from functools import lru_cache

from app.config import settings
from app.services.storage.base import StorageBackend
from app.services.storage.local import LocalStorageBackend, UPLOADS_DIR


@lru_cache
def get_storage() -> StorageBackend:
    backend = (settings.STORAGE_BACKEND or "local").lower().strip()
    public_base = (settings.STORAGE_PUBLIC_BASE_URL or "").strip()

    if backend == "local":
        return LocalStorageBackend(public_base_url=public_base)

    if backend == "gcs":
        from app.services.storage.gcs import GCSStorageBackend

        bucket = (settings.GCS_BUCKET or "").strip()
        if not bucket:
            raise RuntimeError("STORAGE_BACKEND=gcs requires GCS_BUCKET")
        return GCSStorageBackend(
            bucket_name=bucket,
            project=(settings.GCS_PROJECT or "").strip(),
            credentials_path=(settings.GCS_CREDENTIALS_PATH or "").strip(),
            public_base_url=public_base,
        )

    if backend == "s3":
        from app.services.storage.s3 import S3StorageBackend

        bucket = (settings.S3_BUCKET or "").strip()
        if not bucket:
            raise RuntimeError("STORAGE_BACKEND=s3 requires S3_BUCKET")
        return S3StorageBackend(
            bucket_name=bucket,
            region=(settings.AWS_REGION or "us-east-1").strip(),
            endpoint_url=(settings.S3_ENDPOINT_URL or "").strip(),
            public_base_url=public_base,
        )

    raise RuntimeError(f"Unknown STORAGE_BACKEND: {backend!r}. Use local, gcs, or s3.")


__all__ = ["StorageBackend", "LocalStorageBackend", "UPLOADS_DIR", "get_storage"]
