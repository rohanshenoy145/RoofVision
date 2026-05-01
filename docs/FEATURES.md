# RoofVision — Features Overview

## Product goal

Users take a photo of a house, select manufacturer → tile → color (waterfall), and an AI generates a visualization of that roof.

---

## Implemented (Phase 1)

### Backend

| Feature | Status | Location / notes |
|---------|--------|-------------------|
| Health check | Done | `GET /api/v1/health` |
| List manufacturers | Done | `GET /api/v1/manufacturers` |
| List tiles by manufacturer | Done | `GET /api/v1/manufacturers/:id/tiles` |
| List colors by tile | Done | `GET /api/v1/tiles/:id/colors` |
| Database models | Done | Manufacturer, Tile, Color (SQLAlchemy) |
| Pydantic schemas | Done | Response models for all list endpoints |
| Seed data | Done | `scripts/seed_data.py` — GAF, CertainTeed, Owens Corning |
| SQLite support | Done | Default in `.env` for local dev |
| Table creation on startup | Done | `main.py` lifespan |

### Frontend

| Feature | Status | Location / notes |
|---------|--------|-------------------|
| Home screen | Done | "Start Selection" entry |
| Manufacturer list | Done | Fetches from API, navigates to Tiles |
| Tile list | Done | Fetches by manufacturer, shows context |
| Color list | Done | Fetches by tile, shows hex swatches |
| Stack navigation | Done | Home → Manufacturers → Tiles → Colors |
| API client | Done | `src/api/client.js` — fetch wrapper |
| Loading states | Done | Spinner + message on each list screen |
| Error handling | Done | Message if API fails (e.g. backend down) |
| Styling | Done | NativeWind (Tailwind) |
| Web + native | Done | Expo web (e.g. 8083) and Expo Go |

### DevOps / docs

| Feature | Status | Location / notes |
|---------|--------|-------------------|
| Root .gitignore | Done | Dependencies, env, build outputs |
| Backend requirements.txt | Done | FastAPI, SQLAlchemy, Pydantic, etc. |
| SETUP_GUIDE.md | Done | Install and run instructions |
| docs/ folder | Done | Architecture, features, backend, frontend, API ref |

---

### Phase 2 — Camera & upload ✅ (Option A: filesystem)

| Feature | Status | Notes |
|---------|--------|-------|
| Image picker | Done | expo-image-picker — "Choose from library" (web + native) |
| Camera | Done | "Take photo" on device (not web) |
| Upload endpoint | Done | `POST /api/v1/visualizations` (multipart: file + manufacturer_id, tile_id, color_id) |
| Store image | Done | Backend filesystem: `backend/uploads/` (Option A) |
| Serve uploaded image | Done | `GET /api/v1/uploads/{filename}` (StaticFiles) |
| Add Photo screen | Done | After color selection; preview + save; shows saved image URL |
| **Phase 2 UX** | Done | Compact preview (200px height); green "Save to server" button; hint text that user must tap save to persist; success message explains data is on server and that refresh returns to start (no upload history list yet); small thumbnail in success state |

**Validated:** Upload works with a simple JPEG; file appears in `backend/uploads/` and a row in `visualizations` table.

### Phase 3 — AI visualization ✅

| Feature | Status | Notes |
|---------|--------|-------|
| Backend: result_path, error_message | Done | Visualization model + migration for existing DB |
| GET /visualizations/{id} | Done | Poll for status, result_url, error_message |
| Generator service (mock + cloud API) | Done | Mock copies input; if `IMAGE_GEN_PROVIDER=gemini` + API key, calls Gemini (see [IMAGE-GEN-API.md](./IMAGE-GEN-API.md)) |
| Trigger generation on upload | Done | BackgroundTasks after POST |
| Prompt from selection | Done | Manufacturer + tile + color names from DB |
| Result screen | Done | Poll every 2.5s, show “Generating…”, then result image or error |
| Config | Done | `IMAGE_GEN_PROVIDER`, `IMAGE_GEN_API_KEY`, `IMAGE_GEN_MODEL`, `IMAGE_GEN_TIMEOUT_SECONDS` |

---

## Feature summary table

| Area | Implemented | Planned |
|------|-------------|---------|
| Catalog (manufacturer/tile/color) | Yes | — |
| Selection flow in app | Yes | — |
| Camera / image input | Yes | — |
| Image upload to backend | Yes (Option A: filesystem) | — |
| AI roof visualization | Yes (mock + Gemini cloud) | Phase 3 |
| Auth / users | No | Optional later |
