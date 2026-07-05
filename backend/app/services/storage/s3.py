"""S3-compatible storage (AWS S3, Cloudflare R2, MinIO). Requires boto3 when STORAGE_BACKEND=s3."""
from app.services.storage.base import StorageBackend


class S3StorageBackend(StorageBackend):
    def __init__(
        self,
        bucket_name: str,
        region: str = "us-east-1",
        endpoint_url: str = "",
        public_base_url: str = "",
    ):
        try:
            import boto3
        except ImportError as e:
            raise RuntimeError(
                "STORAGE_BACKEND=s3 requires boto3. Install with: pip install boto3"
            ) from e

        client_kwargs = {"region_name": region}
        if endpoint_url:
            client_kwargs["endpoint_url"] = endpoint_url

        self.client = boto3.client("s3", **client_kwargs)
        self.bucket_name = bucket_name
        base = (public_base_url or "").rstrip("/")
        if not base and not endpoint_url:
            base = f"https://{bucket_name}.s3.{region}.amazonaws.com"
        elif not base and endpoint_url:
            base = f"{endpoint_url.rstrip('/')}/{bucket_name}"
        self.public_base_url = base

    def save(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        self.client.put_object(
            Bucket=self.bucket_name,
            Key=key,
            Body=data,
            ContentType=content_type,
        )
        return key

    def read_bytes(self, key: str) -> bytes:
        try:
            resp = self.client.get_object(Bucket=self.bucket_name, Key=key)
        except self.client.exceptions.NoSuchKey as e:
            raise FileNotFoundError(f"S3 object not found: {key}") from e
        return resp["Body"].read()

    def exists(self, key: str) -> bool:
        from botocore.exceptions import ClientError

        try:
            self.client.head_object(Bucket=self.bucket_name, Key=key)
            return True
        except ClientError:
            return False

    def copy(self, src_key: str, dest_key: str) -> str:
        if not self.exists(src_key):
            raise FileNotFoundError(f"S3 source not found: {src_key}")
        self.client.copy_object(
            Bucket=self.bucket_name,
            CopySource={"Bucket": self.bucket_name, "Key": src_key},
            Key=dest_key,
        )
        return dest_key

    def public_url(self, key: str) -> str:
        return f"{self.public_base_url}/{key}"
