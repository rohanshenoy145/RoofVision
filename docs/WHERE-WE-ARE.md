# Where We Are — RoofVision

Quick status for the current session and what’s next.

---

## Done so far

- **Phase 1** — Catalog & selection: manufacturers → tiles → colors. Backend APIs + frontend screens. ✅  
- **Phase 2** — Add photo (camera/gallery), upload to backend, stored in `backend/uploads/` and `visualizations` table. ✅  
- **Phase 3** — AI visualization flow:
  - **Mock:** If no image API is configured, the app copies the uploaded image as the “result” so the flow always works.
  - **Optional cloud API:** Configure `IMAGE_GEN_PROVIDER=gemini` + `IMAGE_GEN_API_KEY`. See [IMAGE-GEN-API.md](./IMAGE-GEN-API.md).
  - Result screen with polling; shows “Generating…” then the image or an error. ✅  

So: **upload + options → something always happens** — either a mock copy or a generated image when the API is configured and succeeds.

---

## Image generation (current design)

- **Simple provider layer** lives under `backend/app/services/image_providers/`, wrapped by `backend/app/services/ai_agent.py`.
- **Default:** `IMAGE_GEN_PROVIDER=mock` — no API key, no Docker.
- **Gemini:** Set `IMAGE_GEN_PROVIDER=gemini`, `IMAGE_GEN_API_KEY`, and optionally `IMAGE_GEN_MODEL`.

---

## Quick links

- [ROADMAP](./ROADMAP.md) — Phases and next steps  
- [IMAGE-GEN-API.md](./IMAGE-GEN-API.md) — How to configure image generation  
- [Architecture](./ARCHITECTURE.md)  
