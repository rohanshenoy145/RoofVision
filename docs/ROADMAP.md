# RoofVision — Product Roadmap

A high-level view of where the product is today and what’s next. Written so anyone (technical or not) can follow the plan.

---

## The big picture

**RoofVision** lets roofers:

1. Take or choose a photo of a house  
2. Pick a manufacturer, then a tile, then a color  
3. Get an AI-generated picture of what that roof would look like with those choices  

The roadmap below breaks this into phases: what’s done and what’s coming.

---

## Phase 1 — Catalog & selection flow ✅ *Completed*

**Goal:** User can open the app and walk through manufacturer → tile → color without taking a photo or generating anything yet.

**What we built:**

- **App opens** to a simple home screen with a “Start” button.
- **First step:** User sees a list of roof manufacturers (e.g. GAF, CertainTeed, Owens Corning).
- **Second step:** After picking a manufacturer, user sees that brand’s product lines (tiles).
- **Third step:** After picking a tile, user sees the available colors, with small color swatches where possible.
- **Under the hood:** The app talks to a small backend that stores and serves this catalog. Everything runs on your own machine (or a server you control) for now.

**Why it matters:** This proves the full path from “tap Start” to “I’ve chosen my roof look.” The rest of the product (camera and AI) will plug into this flow.

**Status:** Done. You can run the app in a browser or on a phone and go through the full selection flow.

---

## Phase 2 — Photo in, image to the cloud ✅ *Completed*

**Goal:** User can add a real photo of a house (camera or gallery) and send it to the backend together with their manufacturer/tile/color choices.

**What we built:**

- **Flow:** Pick options first (manufacturer → tile → color), then add photo. Tapping a color goes to the Add Photo screen.
- **Camera / gallery** — “Choose from library” (web + device; on web it’s a file picker) and “Take photo” (device only).
- **Send to backend** — User sees a compact preview and must tap **“Save to server”** to persist. The app uploads the image plus manufacturer/tile/color IDs. Backend stores the file in `backend/uploads/` (Option A: filesystem) and a row in the `visualizations` table.
- **UX:** Compact image preview (200px), clear save button and hint text, success message that explains data is saved on the server (refreshing the app returns to start; no list of past uploads yet).

**Why it matters:** We now have “this house + this roof choice” stored together. Phase 3 will use that to generate the visualization.

**Status:** Done. Validated with a simple JPEG upload.

---

## Phase 3 — AI roof visualization

**Goal:** After the user sends a photo and their choices, they get back an AI-generated image of the roof with the selected look.

**What we’ll build:**

- **Backend calls an AI service** — Gemini image model to generate “this house with this roof style/color.” (With mock fallback if needed.)
- **User sees the result** — A result screen shows “Generating…” then the generated image (or an error).

**Why it matters:** This is the core value: “See your house with this roof before you buy.”

**Status:** Implemented (mock + Gemini cloud). See [IMAGE-GEN-API.md](./IMAGE-GEN-API.md) for setup and fallback behavior.

---

## Phase 4 — Polish & scale (later)

**Goal:** Make the app reliable, fast, and ready for more users and real-world use.

**Possible pieces (to be decided):**

- **User accounts / login** — So roofers can save projects or history (optional).
- **Faster or clearer feedback** — e.g. “We’re generating your roof…” and then show the image when ready.
- **Better performance** — Handling large images, timeouts, retries.
- **Production hosting** — Running the backend and (if needed) AI on a proper server with backups and monitoring.

**Status:** Not started. We’ll plan this once Phases 2 and 3 are in place.

---

## Visual timeline

```
Phase 1 ✅ ——— Phase 2 ✅ ——— Phase 3 ——— Phase 4
  Done          Photo in      AI image    Polish &
                & upload      result      scale
                (done)
```

---

## What’s next right now

**Current:** Phase 3 is in place (mock + Gemini cloud image API). To get **real** generated images: set `IMAGE_GEN_PROVIDER=gemini` and `IMAGE_GEN_API_KEY` in `backend/.env` (see [IMAGE-GEN-API.md](./IMAGE-GEN-API.md)); on failure the app falls back to mock. See [WHERE-WE-ARE.md](./WHERE-WE-ARE.md).

See “Phase 2 complete?” below to confirm nothing is left to test before Phase 3.

---

## Phase 2 complete? (Before moving to Phase 3)

Use this to confirm Phase 2 is done and nothing critical is left to test:

| Check | What to verify |
|-------|----------------|
| **Upload works** | Pick manufacturer → tile → color → Add Photo → choose image → tap “Save to server”. Green “Saved” appears; no error. |
| **File on disk** | After a successful save, a new file exists in `backend/uploads/` (e.g. `*.jpg`). |
| **Record in DB** | A new row exists in the `visualizations` table with the correct `image_path`, `manufacturer_id`, `tile_id`, `color_id`, `status=pending`. |
| **Image viewable** | Opening `http://localhost:8001/api/v1/uploads/{filename}` in a browser shows the uploaded image. |
| **Web + device** | On web: “Choose from library” works (file picker). On device: “Take photo” and “Choose from library” both work if you’ve tested. |

**Optional (not required for Phase 3):** List of “My uploads” / history screen; edit or delete an upload; larger file size limit or validation. These can be part of Phase 4 (polish).

---

## Where to find more detail

- **Technical architecture and features:** [ARCHITECTURE.md](./ARCHITECTURE.md), [FEATURES.md](./FEATURES.md)  
- **Backend / frontend / API:** [README.md](./README.md) (links to BACKEND, FRONTEND, API-REFERENCE)  
- **How to run the app:** Root [SETUP_GUIDE.md](../SETUP_GUIDE.md)

This roadmap will be updated as phases are completed or the plan changes.
