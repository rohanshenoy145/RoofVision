"""
Gemini image generation/edit provider via Google Generative Language API.

Uses an input image + text prompt and returns generated image bytes.
"""

import base64
import logging
import time

import requests

from app.services.image_providers.base import ImageGenProvider, ImageGenRequest

logger = logging.getLogger(__name__)


class GeminiProviderError(RuntimeError):
    """Generic Gemini provider error."""


class GeminiRateLimitError(GeminiProviderError):
    """Raised when Gemini returns HTTP 429 after retries."""


class GeminiProvider(ImageGenProvider):
    id = "gemini"

    def __init__(
        self,
        api_key: str,
        model: str,
        timeout_seconds: int,
        max_retries: int,
        retry_backoff_seconds: float,
    ) -> None:
        self._api_key = api_key
        self._model = model
        self._timeout = timeout_seconds
        self._max_retries = max(0, max_retries)
        self._retry_backoff_seconds = max(0.1, retry_backoff_seconds)

    def _build_payload(self, req: ImageGenRequest) -> dict:
        prompt = (
            f"{req.prompt}. Keep the same house composition and camera angle. "
            "Only update roof appearance according to the requested style."
        )
        return {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": base64.b64encode(req.image_bytes).decode("utf-8"),
                            }
                        },
                    ],
                }
            ],
            "generationConfig": {
                "temperature": 0.3,
            },
        }

    def _extract_image(self, data: dict) -> bytes:
        candidates = data.get("candidates", [])
        for candidate in candidates:
            content = candidate.get("content", {})
            for part in content.get("parts", []):
                inline = part.get("inlineData") or part.get("inline_data")
                if inline and inline.get("data"):
                    return base64.b64decode(inline["data"])
        raise GeminiProviderError("Gemini response did not include an image")

    def generate(self, req: ImageGenRequest) -> bytes:
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{self._model}:generateContent"
        payload = self._build_payload(req)

        logger.info("Calling Gemini model %s", self._model)
        for attempt in range(self._max_retries + 1):
            try:
                response = requests.post(
                    endpoint,
                    params={"key": self._api_key},
                    json=payload,
                    timeout=self._timeout,
                )
                response.raise_for_status()
                return self._extract_image(response.json())
            except requests.HTTPError as exc:
                status_code = exc.response.status_code if exc.response is not None else None
                retryable = status_code in {429, 500, 502, 503, 504}
                if retryable and attempt < self._max_retries:
                    delay = self._retry_backoff_seconds * (2 ** attempt)
                    logger.warning("Gemini transient HTTP %s, retrying in %.1fs", status_code, delay)
                    time.sleep(delay)
                    continue
                if status_code == 429:
                    raise GeminiRateLimitError("Gemini rate limit/quota reached (HTTP 429)") from exc
                raise GeminiProviderError(f"Gemini API request failed with status {status_code}") from exc
            except (requests.Timeout, requests.ConnectionError) as exc:
                if attempt < self._max_retries:
                    delay = self._retry_backoff_seconds * (2 ** attempt)
                    logger.warning("Gemini network/timeout error, retrying in %.1fs", delay)
                    time.sleep(delay)
                    continue
                raise GeminiProviderError("Gemini request timed out or failed to connect") from exc
