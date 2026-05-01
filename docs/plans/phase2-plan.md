# Phase 2 — Photo upload & storage (Option A: filesystem)

**Status:** ✅ Completed

---

## Goal

User can add a house photo (camera or gallery) and send it to the backend with their manufacturer/tile/color selection. Backend stores the image on disk and a record in the DB.

---

## What was built

- **Backend:** `Visualization` model (image_path, manufacturer_id, tile_id, color_id, status). `POST /visualizations` (multipart upload). Files in `backend/uploads/`. `GET /api/v1/uploads/{filename}` to serve images. Optional `error_message` for Phase 3.
- **Frontend:** Add Photo screen after color selection. “Choose from library” / “Take photo” (expo-image-picker). Compact preview (200px), “Save to server” button, success state with thumbnail. Navigation from Color list with full selection params.
- **UX:** Clear hint that user must tap “Save to server” to persist; success message explains data is on server (refresh returns to start; no history list yet).

---

## Key files

- Backend: `app/models/visualization.py`, `app/api/visualizations.py`, `backend/uploads/`
- Frontend: `src/screens/AddPhotoScreen.js`, `src/api/client.js` (`uploadVisualization`, `getUploadBaseUrl`)

---

## Reference

See [ROADMAP.md](../ROADMAP.md), [FEATURES.md](../FEATURES.md), and [API-REFERENCE.md](../API-REFERENCE.md).
