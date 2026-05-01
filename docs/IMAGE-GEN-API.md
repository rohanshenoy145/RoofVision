# Image generation API (Gemini + mock)

This backend generates **roof visualizations** by sending your uploaded photo plus a **text prompt** (built from manufacturer / tile / color) to a simple AI agent that uses either:
- **`gemini`** for cloud generation
- **`mock`** as a safe fallback that returns the original image

---

## Design

| Piece | Role |
|--------|------|
| **`ImageGenProvider`** | Abstract interface: `generate(ImageGenRequest) → bytes` |
| **`MockProvider`** | `mock` — returns the input image unchanged (no network call) |
| **`GeminiProvider`** | `gemini` — calls Gemini image generation via Google API |
| **Factory** | Reads `IMAGE_GEN_*` from `.env` and returns the right provider |
| **`AIAgent`** | Thin orchestrator class that wraps provider calls |

Adding a new backend later = create a provider class under `app/services/image_providers/` and register it in `factory.py`.

---

## Configuration (`backend/.env`)

```env
# Default: no API key, mock only (copy of uploaded photo as "result")
IMAGE_GEN_PROVIDER=mock

# Use Gemini cloud (get API key from Google AI Studio)
IMAGE_GEN_PROVIDER=gemini
IMAGE_GEN_API_KEY=your_google_ai_api_key_here
IMAGE_GEN_MODEL=gemini-3.1-flash-image-preview
IMAGE_GEN_TIMEOUT_SECONDS=180
IMAGE_GEN_MAX_RETRIES=2
IMAGE_GEN_RETRY_BACKOFF_SECONDS=1.5
```

**Never commit** `.env` or real keys. Use `.env.example` as a template.

### Switching Gemini models

Change `IMAGE_GEN_MODEL` to another Gemini image-capable model as needed.

### Guardrails

- `IMAGE_GEN_MAX_RETRIES` controls retries for transient failures (`429`, `5xx`, timeout/network).
- `IMAGE_GEN_RETRY_BACKOFF_SECONDS` controls exponential retry delay base.
- On provider failure, backend falls back to mock and stores a user-friendly `error_message`.

---

## Behavior

1. User uploads a house photo and completes selection.
2. Backend builds a prompt like:  
   `house with {manufacturer} {tile} {color} roof shingles, photorealistic, high quality`
3. `get_image_provider()` runs the configured provider.
4. If the provider **fails** (network, quota, error), the backend **falls back to mock** so the user still sees a result (their original photo).
5. `Visualization.generator` is set to `mock` or `gemini` for the UI.

---

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| Always mock | `IMAGE_GEN_PROVIDER` is `mock` or `IMAGE_GEN_API_KEY` is empty |
| Gemini errors | Check API key, quota/billing, and that `IMAGE_GEN_MODEL` is image-capable |
| Rate limit (`429`) | Increase Gemini quota/billing, reduce burst traffic, and tune retry settings |
| Timeout | Increase `IMAGE_GEN_TIMEOUT_SECONDS` (generation can take 1–3+ minutes) |
