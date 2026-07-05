"""Google Cloud Storage backend. Requires google-cloud-storage when STORAGE_BACKEND=gcs."""
from app.services.storage.base import StorageBackend


class GCSStorageBackend(StorageBackend):
    def __init__(self, bucket_name: str, project: str = "", credentials_path: str = "", public_base_url: str = ""):
        try:
            from google.cloud import storage
        except ImportError as e:
            raise RuntimeError(
                "STORAGE_BACKEND=gcs requires google-cloud-storage. "
                "Install with: pip install google-cloud-storage"
            ) from e

        if credentials_path:
            self.client = storage.Client.from_service_account_json(credentials_path, project=project or None)
        else:
            self.client = storage.Client(project=project or None)

        self.bucket = self.client.bucket(bucket_name)
        self.bucket_name = bucket_name
        base = (public_base_url or f"https://storage.googleapis.com/{bucket_name}").rstrip("/")
        self.public_base_url = base

    def _blob(self, key: str):
        return self.bucket.blob(key)

    def save(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        blob = self._blob(key)
        blob.upload_from_string(data, content_type=content_type)
        return key

    def read_bytes(self, key: str) -> bytes:
        blob = self._blob(key)
        if not blob.exists():
            raise FileNotFoundError(f"GCS object not found: {key}")
        return blob.download_as_bytes()

    def exists(self, key: str) -> bool:
        return self._blob(key).exists()

    def copy(self, src_key: str, dest_key: str) -> str:
        src = self._blob(src_key)
        if not src.exists():
            raise FileNotFoundError(f"GCS source not found: {src_key}")
        self.bucket.copy_blob(src, self.bucket, dest_key)
        return dest_key

    def public_url(self, key: str) -> str:
        return f"{self.public_base_url}/{key}"
