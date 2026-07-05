# POC → App Store — gaps, priorities, and decisions

This doc is a **working checklist** for moving RoofVision from “POC approved” to something you can ship on **Apple App Store** and **Google Play**, plus run reliably in production. Use it across sessions to pick work in sensible order.

**Principles (short):** ship a narrow, honest product; secure secrets and PII; automate deploys; measure failures; prefer boring infra until scale demands more.

---

## Done in repo without your cloud accounts (keep this list updated)

These reduce Phase A risk **before** you wire AWS, hosted DB, or real legal URLs:

| Area | What landed |
|------|----------------|
| **CORS** | `CORS_ORIGINS` in `backend/.env` — comma-separated browser origins. **Unset = `*`** (dev). Set explicit origins for production web clients; `allow_credentials` is off when using `*`. |
| **Readiness** | `GET /api/v1/health` — liveness. `GET /api/v1/health/ready` — DB `SELECT 1` (503 if DB down). |
| **Upload rate limit** | `POST /visualizations` — SlowAPI per IP (`RATE_LIMIT_UPLOAD`, default `30/minute`). Returns **429** when exceeded. |
| **Catalog error UX** | Manufacturers / tiles / colors: clearer network vs server errors, **Retry** button, pull-to-**refresh**. |
| **Fetch errors** | API client wraps failed `fetch` so offline / wrong host surfaces consistently. |
| **Demo auth for review** | `EXPO_PUBLIC_HIDE_DEMO_GOOGLE=1` hides demo Google; guest remains (`frontend/src/constants/flags.js`, `eas.json` preview/production). |
| **Privacy link shell** | `EXPO_PUBLIC_PRIVACY_POLICY_URL` — Settings shows “Open privacy policy” when set (`frontend/.env.example`). |
| **Native save** | iOS/Android: download result → **photo library** via `expo-file-system` + `expo-media-library` (fallback: open URL). Web: download link. `NSPhotoLibraryAddUsageDescription` on iOS. |
| **Store scaffolding** | `frontend/eas.json` (dev / preview / production profiles). `app.json`: `ios.bundleIdentifier` + `android.package` placeholders (`com.roofvision.app` — **change before you own the bundle id**). |
| **Object storage scaffold** | `STORAGE_BACKEND=local\|gcs\|s3` in `backend/app/services/storage/` — swap to GCS/S3 by env when cloud is ready. |
| **Postgres migrations** | Alembic under `backend/alembic/` — `alembic upgrade head` for production; SQLite still auto-creates locally. |
| **Deploy templates** | `backend/Dockerfile`, `backend/fly.toml`, `docker-compose.yml` (local Postgres), `docs/DEPLOY.md`. |
| **Legal drafts** | `docs/legal/privacy.md`, `docs/legal/terms.md` — host and set `EXPO_PUBLIC_*` URLs. |
| **Terms / support links** | `EXPO_PUBLIC_TERMS_OF_USE_URL`, `EXPO_PUBLIC_SUPPORT_URL` in flags + Settings. |
| **Sentry scaffold** | Backend: `SENTRY_DSN` in config + `main.py`. Frontend: `src/utils/observability.js` + `EXPO_PUBLIC_SENTRY_DSN`. |
| **Cloud media URLs** | API returns absolute URLs when using GCS/S3/CDN; `resolveMediaUrl()` in client handles both. |

You still own: **HTTPS host**, **live secrets**, **GCS/S3 bucket credentials**, **Postgres host**, **hosted legal URLs**, **EAS Apple/Google accounts**, **full Sentry project**.

---

## What you already have (POC bar)

- End-to-end flow: catalog → photo → generate → result (mock + optional Gemini).
- Expo + React Native + **expo-image-picker** / **expo-camera** — on a **real device**, the OS already shows the standard sheet (library vs camera) where supported; web uses file picker. **No separate “migration”** is required for that UX on phone — it is largely **already the mobile path**; polish and permissions copy matter more than a new library.
- Compliance-oriented copy hooks (`docs/COMPLIANCE-AND-COPY.md`, onboarding, disclaimers).

---

## Phase A — Store blockers (do these before submission)

These are **not optional** for public store listing + real users.

### Frontend (mobile release)

| Item | Why | Notes |
|------|-----|--------|
| **EAS Build + store metadata** | Stores require signed binaries | Expo Application Services (`eas build`), `app.json` / `app.config`: `ios.bundleIdentifier`, Android `package`, version/build numbers, icons, splash. |
| **Privacy Policy URL** | Required in store listings + often in-app | Host a real URL; link from Settings / store listing. |
| **Permissions strings** | Apple rejects vague usage descriptions | `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription` (already present — review wording vs actual behavior). |
| **Remove or gate demo auth** | Reviewers see “fake” sign-in | Guest-only, or real auth, or hide demo Google before review. |
| **API base URL for production** | App must hit your API, not localhost | `EXPO_PUBLIC_API_BASE_URL` at build time, or runtime config from a small remote config. |
| **Crash / analytics (minimal)** | Debug production issues | Sentry or similar; keep privacy policy aligned. |
| **Offline / error UX** | Network fails on cellular | Clear errors; retry; don’t infinite-spin. |
| **Save / share result on device** | Current “save” may open URL | Prefer `expo-media-library` or share sheet for native save expectations. |

### Backend (production API)

| Item | Why | Notes |
|------|-----|--------|
| **Hosted API + HTTPS** | TLS required in practice | Fly.io, Railway, Render, GCP, AWS, etc. |
| **Secrets management** | `DATABASE_URL`, `IMAGE_GEN_API_KEY` must not live in repo | Env vars / secret manager; rotate keys. |
| **CORS locked to app origins** | Security + predictable browser behavior | Replace `allow_origins=["*"]` with your web admin origin + omit credentialed wildcard patterns. |
| **Rate limiting + upload limits** | Abuse + cost (Gemini) | Per-IP or per-token limits; max body size; timeouts already partly there. |
| **Persistence beyond SQLite on one disk** | Uptime + backups | PostgreSQL (or managed SQL); file storage → S3-compatible bucket for uploads/results. |
| **Migrations** | Safe schema changes | Alembic (already in requirements) wired to CI/deploy. |
| **Health + readiness** | Load balancers / ops | `GET /health` exists; add DB connectivity check if needed. |

### Legal / product (cross-cutting)

| Item | Why |
|------|-----|
| **Terms of Use** | Especially with uploads + AI output. |
| **Data retention & deletion** | How long photos live; user request path if you add accounts. |
| **Age / region** | COPPA, GDPR if EU users — even lean apps should document intent. |

---

## Phase B — Strongly recommended (shortly after launch or before scale)

| Area | Item |
|------|------|
| **Auth** | Real identity (Apple / Google / email) if you need history, abuse controls, or paid tiers. |
| **Observability** | Structured logs, request IDs, error rates, Gemini latency/quota metrics. |
| **Job queue** | Move generation off `BackgroundTasks` to Celery/RQ + Redis for retries and visibility at volume. |
| **CDN** | Serve `uploads`/results via CDN URLs for faster load on mobile. |
| **iOS/Android store assets** | Screenshots, description, support URL, export compliance if using encryption APIs. |

---

## Phase C — Longer-term (scale & quality)

| Area | Item |
|------|------|
| **Multi-region / HA** | When traffic and SLA demand it. |
| **Roof pipeline** | Segmentation / masks for better previews (`COMPLIANCE-AND-COPY.md` “engineering direction”). |
| **Cost controls** | Per-user quotas, caching, smaller images where acceptable. |
| **Admin / moderation** | If user-generated content grows. |

---

## Mobile app store path — feasibility

**Verdict:** You are **already on** the standard path for a small team: **Expo managed workflow → EAS Build → TestFlight / Play internal testing → production tracks.**

- **Not a rewrite:** Same codebase targets iOS and Android; store submission is mostly **config, signing, policies, and hosting**.
- **Photo UX on phones:** `expo-image-picker` uses the system UI. Tuning `allowsEditing`, `quality`, and platform-specific flows is normal polish, not a separate “web vs mobile” product.

---

## Local testing on your physical phone (no store yet)

| Approach | What you do | Best for |
|----------|-------------|----------|
| **Expo Go** | Install **Expo Go** from App Store / Play. On Mac: `cd frontend && npx expo start`. Scan QR. Phone must reach your machine (same Wi‑Fi; `API_BASE_URL` = Mac LAN IP, not `localhost`). | Fastest iteration; some native modules restricted. |
| **Development build** | `eas build --profile development` installs a dev client on device; still loads JS from Metro or a dev server URL. | Closer to production binary; good before TestFlight. |
| **USB “plug in”** | Optional: Xcode / Android Studio run-on-device; not required for Expo day-to-day. | Debugging native crashes, signing issues. |

You do **not** need to “host the app on your phone” as a server — the **phone is the client**; the **backend** runs on your Mac or in the cloud.

---

## Suggested order of attack (next few sessions)

1. **Production API** on a host + HTTPS + env secrets + tighten CORS.  
2. **Object storage** for uploads/results (or documented path to add S3).  
3. **EAS** project setup, identifiers, first **internal** iOS/Android builds.  
4. **Privacy policy + Terms** URLs and in-app links.  
5. **Production API URL** in app config + TestFlight / Play internal with real backend.  
6. **Auth decision** (guest-only v1 vs real sign-in) before broad rollout.  
7. **Analytics / crashes** minimal slice.  
8. **Save/share** polish on native.

Treat **“migrate to mobile”** as **Phase 2 polish + store process**, not a greenfield rewrite — unless you explicitly choose native Swift/Kotlin later (usually unnecessary here).

---

## Doc maintenance

Update this file when you close gaps (check rows, add dates). Link out to detailed specs (`IMAGE-GEN-API.md`, `COMPLIANCE-AND-COPY.md`, `ARCHITECTURE.md`) instead of duplicating them here.
