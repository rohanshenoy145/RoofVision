# RoofVision — Product Roadmap

A high-level view of where the product is today and what’s next. Written so anyone (technical or not) can follow the plan.

---

## The big picture

**RoofVision** lets roofers:

1. Choose a roof material type (tile, shingle, metal), then a manufacturer, product line, and color  
2. Take or choose a photo of a house  
3. Get an AI-generated **preview** of what that roof style could look like (approximate, not an official match)  

The roadmap below breaks this into phases: what’s done and what’s coming.

---

## Phase 1 — Catalog & selection flow ✅ *Completed*

**Goal:** User can open the app and walk through material type → manufacturer → product (tile) → color without taking a photo or generating anything yet.

**What we built:**

- **App opens** to a simple home screen with a “Start” button.
- **First step:** User picks a **material type** (tile, shingle, or metal), then sees manufacturers filtered to that type.
- **Second step:** After picking a manufacturer, user sees that brand’s product lines (tiles).
- **Third step:** After picking a tile, user sees the available colors, with small color swatches where possible.
- **Under the hood:** The app talks to a small backend that stores and serves this catalog. Everything runs on your own machine (or a server you control) for now.

**Why it matters:** This proves the full path from “tap Start” to “I’ve chosen my roof look.” The rest of the product (camera and AI) will plug into this flow.

**Status:** Done. You can run the app in a browser or on a phone and go through the full selection flow.

---

## Phase 2 — Photo in, image to the cloud ✅ *Completed*

**Goal:** User can add a real photo of a house (camera or gallery) and send it to the backend together with their manufacturer/tile/color choices.

**What we built:**

- **Flow:** Pick options first (material → manufacturer → tile → color), then add photo. Tapping a color goes to the Add Photo screen.
- **Camera / gallery** — “Choose from library” (web + device; on web it’s a file picker) and “Take photo” (device only).
- **Send to backend** — User sees a compact preview and confirms upload. The app sends the image plus manufacturer/tile/color IDs. Backend stores the file in `backend/uploads/` (Option A: filesystem) and a row in the `visualizations` table.
- **UX:** Compact image preview, clear confirm action and hint text, success feedback; refreshing the app returns to start (no history list yet).

**Why it matters:** We now have “this house + this roof choice” stored together. Phase 3 will use that to generate the visualization.

**Status:** Done. Validated with a simple JPEG upload.

---

## Phase 3 — AI roof visualization

**Goal:** After the user sends a photo and their choices, they get back an AI-generated image of the roof with the selected look.

**What we built:**

- **Backend calls an AI service** — Gemini image model (or **mock**, which returns the input image) using a roof-focused prompt built from the catalog.
- **User sees the result** — A result screen polls until “Generating…” resolves to the image or an error; optional save / try another photo in the app.

**Why it matters:** This is the core value: a quick visual **preview** to discuss options with homeowners—not a warranty or official color match.

**Status:** Implemented (mock + Gemini cloud, retries + mock fallback on failure). See [IMAGE-GEN-API.md](./IMAGE-GEN-API.md). For product language guardrails, see [COMPLIANCE-AND-COPY.md](./COMPLIANCE-AND-COPY.md).

---

## Phase 4 — Polish & scale (later)

**Goal:** Make the app reliable, fast, and ready for more users and real-world use.

**Possible pieces (to be decided):**

- **User accounts / login** — So roofers can save projects or history (optional).
- **Faster or clearer feedback** — e.g. “We’re generating your roof…” and then show the image when ready.
- **Better performance** — Handling large images, timeouts, retries.
- **Production hosting** — Running the backend and (if needed) AI on a proper server with backups and monitoring.

**Status:** Not started. Plan once you want accounts, history, production hosting, or stronger compliance UX in-app.

---

## Visual timeline

```
Phase 1 ✅ ——— Phase 2 ✅ ——— Phase 3 ✅ ——— Phase 4
  Done          Photo in      AI preview  Polish &
                & upload      (mock +     scale
                (done)      Gemini)
```

---

## What’s next right now

**Current:** Phases 1–3 are done. For cloud generation: set `IMAGE_GEN_PROVIDER=gemini` and `IMAGE_GEN_API_KEY` in `backend/.env` (see [IMAGE-GEN-API.md](./IMAGE-GEN-API.md)); on failure the backend falls back to mock and may set `error_message`. See [WHERE-WE-ARE.md](./WHERE-WE-ARE.md) and [COMPLIANCE-AND-COPY.md](./COMPLIANCE-AND-COPY.md).

The “Phase 2 complete?” checklist below remains useful for regression testing uploads.

---

## Phase 2 complete? (Before moving to Phase 3)

Use this to confirm Phase 2 is done and nothing critical is left to test:

| Check | What to verify |
|-------|----------------|
| **Upload works** | Pick material → manufacturer → tile → color → Add Photo → choose image → confirm upload. Success feedback; no error. |
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
