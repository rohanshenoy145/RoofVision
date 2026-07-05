# RoofVision — Features Overview

## Product goal

Users choose **material type** first, then **manufacturer → product (tile) → color**, add a house photo, and an AI generates an **approximate roof preview** (Gemini) with mock fallback if the API is unavailable or rate-limited.

---

## Implemented (Phase 1)

### Backend

| Feature | Status | Location / notes |
|---------|--------|-------------------|
| Health check | Done | `GET /api/v1/health` |
| List manufacturers | Done | `GET /api/v1/manufacturers` (optional `?material_type=tile|shingle|metal`) |
| List tiles by manufacturer | Done | `GET /api/v1/manufacturers/:id/tiles` |
| List colors by tile | Done | `GET /api/v1/tiles/:id/colors` |
| Database models | Done | Manufacturer (`material_type`), Tile, Color, Visualization (SQLAlchemy) |
| Pydantic schemas | Done | Response models for all list endpoints |
| Seed data | Done | `scripts/seed_data.py` — GAF, CertainTeed, Owens Corning |
| SQLite support | Done | Default in `.env` for local dev |
| Table creation on startup | Done | `main.py` lifespan |
| Readiness probe | Done | `GET /api/v1/health` (liveness), `GET /api/v1/health/ready` (DB check, 503 if down) |
| CORS configuration | Done | `CORS_ORIGINS` env — unset = `*` (dev); set explicit origins for production web |
| POST upload rate limit | Done | SlowAPI per IP on `POST /visualizations` (`RATE_LIMIT_UPLOAD`, default `30/minute`) |

### Frontend

| Feature | Status | Location / notes |
|---------|--------|-------------------|
| Home screen | Done | Hero + CTA; navigates to material selection |
| Material screen | Done | Tile / Shingle / Metal → filtered manufacturers |
| Manufacturer list | Done | Fetches with optional `material_type`; empty state if none |
| Tile list | Done | Fetches by manufacturer, shows context |
| Color list | Done | Fetches by tile, shows hex swatches |
| Stack navigation | Done | After auth + onboarding: Home → Material → … → Result; **Settings** from Home header |
| Auth gate (UI) | Done | `AuthScreen` — **Continue with Google** (demo sign-in stub), **Continue as guest**; `AuthContext` + AsyncStorage |
| Onboarding | Done | First-run expectations + compliance copy; persisted until sign out |
| About & settings | Done | `SettingsScreen` — account summary, draft legal blurb, sign out |
| Result compare | Done | Side-by-side **Original** vs **AI preview**; **Expand compare** modal with synced **Zoom** (1×–2×) |
| Input quality hint | Done | Heuristic from picker metadata (resolution, aspect, file size) on Add Photo + Result |
| In-app disclaimers | Done | Shared copy in `constants/copy.js`; hero strip on Home; strip on Result |
| API client | Done | `src/api/client.js` — fetch wrapper |
| Loading states | Done | Spinner + message on each list screen |
| Error handling | Done | Message if API fails (e.g. backend down) |
| Styling | Done | NativeWind (Tailwind); refreshed cards / steps on list screens |
| Web + native | Done | Expo web (e.g. 8083) and Expo Go |
| Catalog network UX | Done | `networkError.js` + Retry + pull-to-refresh on manufacturer/tile/color lists |
| Store-oriented flags | Done | `flags.js` — `EXPO_PUBLIC_HIDE_DEMO_GOOGLE`, `EXPO_PUBLIC_PRIVACY_POLICY_URL`; `eas.json` profiles |
| Native save result | Done | `expo-file-system` + `expo-media-library` on iOS/Android (web stays download link) |

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
| Add Photo screen | Done | After color selection; preview + **Generate** uploads to `POST /visualizations` |
| **Phase 2 UX** | Done | Compact preview; **Generate** triggers upload + background job; camera on device only |

**Validated:** Upload works with a simple JPEG; file appears in `backend/uploads/` and a row in `visualizations` table.

### Phase 3 — AI visualization ✅

| Feature | Status | Notes |
|---------|--------|-------|
| Backend: result_path, error_message | Done | Visualization model + migration for existing DB |
| GET /visualizations/{id} | Done | Poll for status, result_url, error_message |
| Generator service (mock + Gemini) | Done | `AIAgent` + providers; Gemini with retries/backoff; on failure falls back to mock and may set `error_message` for UI (see [IMAGE-GEN-API.md](./IMAGE-GEN-API.md)) |
| Trigger generation on upload | Done | BackgroundTasks after POST |
| Prompt from selection | Done | Names + `material_type` + tile `slug` hints + optional `hex_code` for stronger geometry/texture language |
| Result screen | Done | Poll; side-by-side + expand compare; mock banner; **Save image** + **Try another photo**; passes `inputQuality` from Add Photo |
| Config | Done | `IMAGE_GEN_*` including `IMAGE_GEN_MAX_RETRIES`, `IMAGE_GEN_RETRY_BACKOFF_SECONDS` (see [IMAGE-GEN-API.md](./IMAGE-GEN-API.md)) |

---

## Feature summary table

| Area | Implemented | Planned |
|------|-------------|---------|
| Catalog (manufacturer/tile/color) | Yes | — |
| Selection flow in app | Yes | — |
| Camera / image input | Yes | — |
| Image upload to backend | Yes (Option A: filesystem) | — |
| AI roof visualization | Yes (mock + Gemini cloud) | Improve accuracy pipeline (roof mask, plane fit — see roadmap) |
| Auth / users | Partial | UI-only auth gate with demo Google stub + guest mode; backend OAuth deferred. |
| Compliance copy | Yes (v1) | Onboarding + Home + Result strips — extend per [COMPLIANCE-AND-COPY.md](./COMPLIANCE-AND-COPY.md) |
