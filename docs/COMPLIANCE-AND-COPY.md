# RoofVision — Compliance, copy, and product positioning

This document distills **product and legal-safety guidance** for RoofVision as an independent roof **visualization** tool. It aligns engineering and UX copy so we stay in “preview / simulation” territory and avoid implying manufacturer endorsement or photographic accuracy we do not have.

For the full original discussion, see your internal notes (e.g. *ROOF VISION NOTES.pdf*). **Do not paste API keys, one-time codes, or unrelated secrets into the repo.**

---

## What RoofVision is (and is not)

- **Is:** An AI-assisted **approximate preview** to help homeowners and contractors compare roof **direction** (material family, product line name, color intent) on a supplied photo.
- **Is not:** An official manufacturer tool, certified color matcher, or guaranteed representation of installed product.

---

## Naming and catalog data (safe use of brand text)

Generally acceptable for identification in a beta-style product:

- Manufacturer **names** as text (e.g. catalog labels).
- Product **line / style names** as text.
- Color **names** as text.

Avoid unless you have explicit permission and licensed assets:

- Manufacturer **logos** and trademark artwork.
- **Official marketing photos**, brochures, CAD packs, or manufacturer texture libraries used as training or texture sources.
- Marketing copy **verbatim** from manufacturers.
- Language implying **official**, **approved**, **partner**, **certified**, or **exact match**.

Preferred user-facing terms:

- “Preview”, “simulation”, “approximation”, “AI-generated preview”

Avoid unless true and contractually backed:

- “Exact match”, “color-accurate to manufacturer spec”, “official visualization”

---

## Disclaimers (recommended UX)

### One-time onboarding

Short version:

> RoofVision is an independent visualization tool. Brand and product names are used for identification only. Images are AI-generated previews and may not match real materials, colors, lighting, or installation. Confirm final selections with physical samples and manufacturer specifications.

### Always near the generated image

Short version:

> **AI preview — approximate visualization.** Final appearance may vary.

### Settings / About

> RoofVision is not affiliated with or endorsed by any manufacturer unless explicitly stated in writing.

### Implemented in the app (current)

- **Onboarding screen** — first-run acceptance; covers AI preview limits, photo quality expectations, and non-affiliation (see `frontend/src/screens/OnboardingScreen.js`).
- **Shared copy** — `frontend/src/constants/copy.js` (short disclaimer on Home hero and Result).
- **About & settings** — draft privacy / legal placeholder + sign out (`SettingsScreen`).
- **Compare UI** — side-by-side original vs preview supports transparency without implying pixel-perfect accuracy; keep language in “preview” territory.

---

## Accuracy levels (product strategy)

These map to how “real” the roof looks vs how defensible the claims are:

| Level | Goal | Typical approach |
|-------|------|-------------------|
| **A — AI preview** | Fast, useful for selling the idea | Generic material look + color intent from selection + strong “approximate” labeling |
| **B — Independently verified** | Closer look without manufacturer dependency | Your own photographed samples, controlled lighting, owned texture references |
| **C — Official / licensed** | Highest accuracy + strongest claims | Licensed assets + brand program + contract terms |

Current app is closest to **Level A** unless you add owned reference assets (Level B) or partnerships (Level C).

---

## Engineering direction (future, aligned with notes)

A more defensible visualization pipeline often includes:

1. **Roof region detection** — mask roof planes; exclude non-roof regions when possible.
2. **Plane / perspective estimation** — map materials with less “paint over” artifact.
3. **Lighting normalization** — reduce mismatch between input photo and generated overlay.
4. **Material rendering** — texture scale, edge blending at eaves/ridges.
5. **Post-process match** — noise, sharpness, tone to match the photo.

Today’s implementation uses a **single full-frame image edit** via Gemini with a structured prompt; the steps above are **roadmap** items, not all implemented.

---

## Dependencies and licensing (engineering hygiene)

- Prefer permissive OSS licenses (MIT, BSD, Apache) for libraries you ship.
- Track major dependencies; avoid GPL/AGPL-style copyleft in core product paths unless you fully understand compliance implications.

---

## What we intentionally avoid in v1 (scope guardrails)

Examples aligned with staying focused on visualization:

- Estimates, pricing, proposals, CRM, or job workflow inside RoofVision.
- Storing unnecessary PII (homeowner names, street addresses, payment data) unless there is a clear product need and policy.

These boundaries can evolve, but **claims and data minimization** should stay conservative until legal review.
