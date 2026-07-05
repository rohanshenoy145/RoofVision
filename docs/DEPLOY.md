# RoofVision — deploy & cloud credentials checklist

Use this when you enable billing (GCP, Fly, etc.). **Fill secrets in your host’s dashboard or `fly secrets set` — never commit real values.**

---

## 1. Backend environment variables

Copy `backend/.env.example` → `backend/.env` locally. In production, set the same keys on your host.

| Variable | When | What to fill |
|----------|------|----------------|
| `DATABASE_URL` | Production | Managed Postgres URL (Fly Postgres, Cloud SQL, Railway, etc.) |
| `ENVIRONMENT` | Production | `production` |
| `CORS_ORIGINS` | Web client | Comma-separated HTTPS origins (omit `*` in prod) |
| `IMAGE_GEN_PROVIDER` | AI | `gemini` |
| `IMAGE_GEN_API_KEY` | AI | Google AI / Gemini API key |
| `STORAGE_BACKEND` | Cloud storage | `gcs` or `s3` (default `local`) |
| `GCS_BUCKET` | GCS | Bucket name |
| `GCS_PROJECT` | GCS | GCP project id |
| `GCS_CREDENTIALS_PATH` | GCS | Path to service account JSON on server (or use workload identity) |
| `STORAGE_PUBLIC_BASE_URL` | CDN | Optional CDN URL prefix for public objects |
| `S3_BUCKET` | AWS/R2 | Bucket name |
| `AWS_REGION` | AWS | e.g. `us-east-1` |
| `S3_ENDPOINT_URL` | R2/MinIO | Custom endpoint if not AWS |
| `SENTRY_DSN` | Optional | Sentry project DSN |
| `RATE_LIMIT_UPLOAD` | Optional | e.g. `20/minute` |

**Install optional Python packages when needed:**

```bash
pip install google-cloud-storage   # STORAGE_BACKEND=gcs
pip install boto3                  # STORAGE_BACKEND=s3
```

---

## 2. Frontend / EAS environment variables

Copy `frontend/.env.example` → `frontend/.env` for local device testing.

| Variable | When | What to fill |
|----------|------|----------------|
| `EXPO_PUBLIC_API_BASE_URL` | Device + store builds | `https://your-api.example.com/api/v1` |
| `EXPO_PUBLIC_HIDE_DEMO_GOOGLE` | Store review | `1` (already in `eas.json` preview/production) |
| `EXPO_PUBLIC_PRIVACY_POLICY_URL` | Store listing | Hosted privacy page URL |
| `EXPO_PUBLIC_TERMS_OF_USE_URL` | Store listing | Hosted terms URL |
| `EXPO_PUBLIC_SUPPORT_URL` | Store listing | `mailto:` or support page |
| `EXPO_PUBLIC_SENTRY_DSN` | Optional | Sentry React Native DSN (requires dev/prod build, not Expo Go) |

Set the same `EXPO_PUBLIC_*` values in **EAS** → Project → Environment variables (or edit `frontend/eas.json` env blocks).

---

## 3. Deploy backend (Fly.io example)

```bash
cd backend
fly auth login
fly launch   # or fly apps create roofvision-api
fly postgres create   # optional managed DB
fly secrets set DATABASE_URL="..." IMAGE_GEN_API_KEY="..." GCS_BUCKET="..."
fly deploy
```

Health checks: `GET /api/v1/health` (liveness), `GET /api/v1/health/ready` (DB).

---

## 4. Legal pages

Draft templates live in `docs/legal/`. Host them on your site (GitHub Pages, Notion public page, etc.) and paste URLs into EAS env.

---

## 5. EAS Build (after Apple Developer account)

```bash
cd frontend
npm install -g eas-cli
eas login
eas build:configure
eas build --profile preview --platform ios
```

See `docs/POC-TO-APP-STORE.md` for the full store checklist.
