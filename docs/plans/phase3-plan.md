# Phase 3 — AI roof visualization

**Status:** In progress

---

## Goal

After the user uploads a house photo and selects manufacturer/tile/color, they get an **AI-generated image** (or mock) showing that house with the selected roof look. The app displays that image on a Result screen.

---

## AI: Mock + pluggable image API

- **Mock (default):** If `IMAGE_GEN_PROVIDER=mock` (or no API key), the backend copies the uploaded image to a result file and marks the job `completed`.
- **Cloud (Gemini):** If `IMAGE_GEN_PROVIDER=gemini` and `IMAGE_GEN_API_KEY` are set, the backend calls Gemini with image + prompt; on failure it falls back to mock.

See [IMAGE-GEN-API.md](../IMAGE-GEN-API.md).

---

## What we need / did

### Backend

- [x] Add `result_path` and `error_message` to `Visualization` model.
- [x] Add `result_url` and `error_message` to API response schema.
- [x] `GET /visualizations/{id}` — return job with status, image_url, result_url (when completed), error_message (when failed).
- [x] AI service: `app/services/generator.py` + `app/services/image_providers/` + `app/services/ai_agent.py` — mock or Gemini; save result to `uploads/`; update job.
- [x] Trigger generation in background after `POST /visualizations` (FastAPI `BackgroundTasks`). Idempotent: if job already `completed`, skip.
- [x] Config: `IMAGE_GEN_PROVIDER`, `IMAGE_GEN_API_KEY`, `IMAGE_GEN_MODEL`, `IMAGE_GEN_TIMEOUT_SECONDS`.

### Frontend

- [x] After “Save to server” succeeds, navigate to **Result** screen with visualization `id`.
- [x] Result screen: poll `GET /visualizations/{id}` every 2–3 s; show “Generating…”, then result image or error.
- [x] Success: show generated image; error: show message.

### Mapping selection → prompt

- [x] Backend loads manufacturer, tile, color names from DB and builds prompt, e.g. `"house with [manufacturer] [tile] [color] roof shingles, photorealistic"`.

### Docs

- [x] Phase plans in `docs/plans/` (phase1, phase2, phase3).
- [x] API-REFERENCE, FEATURES, ROADMAP updated.

---

## Suggested implementation order

1. Backend: model + schema + GET /visualizations/{id}.
2. Backend: generator service (mock first).
3. Backend: trigger generation in background on POST.
4. Frontend: Result screen + polling.
5. Backend: wire cloud provider + prompt mapping.
6. Docs and config.

---

## Out of scope (Phase 4)

- User accounts; “My visualizations” list; edit/delete; rate limiting.
