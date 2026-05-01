# RoofVision — Ground Zero Setup Guide

Cross-platform mobile app for roofers: photo → manufacturer/tile/color selection → AI roof visualization.

---

## Tech Stack

| Layer    | Stack                                                                 |
|----------|-----------------------------------------------------------------------|
| Frontend | React Native, Expo (Managed), NativeWind (Tailwind), lucide-react-native |
| Backend  | Python FastAPI, SQLAlchemy (PostgreSQL), Pydantic                      |
| AI       | Gemini API (with mock fallback)                                       |

---

## 1. Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **PostgreSQL** (local or cloud)
- **Expo Go** app on your phone (for testing)
- **Xcode** (macOS) or **Android Studio** (for simulators)

---

## 2. Backend Setup

### Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Environment

```bash
cp .env.example .env
# .env defaults to SQLite (sqlite:///./roofvision.db) for easy local dev.
# For PostgreSQL, uncomment and set DATABASE_URL.
```

### Seed Data (Phase 1)

```bash
# From backend/
python -m scripts.seed_data
```

Populates manufacturers (GAF, CertainTeed, Owens Corning), tiles, and colors.

### Run the Server

```bash
# From backend/
python run.py
# Or: uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

API: http://localhost:8001  
Docs: http://localhost:8001/docs

### Backend Folder Structure

```
backend/
├── app/
│   ├── main.py, config.py, database.py
│   ├── api/              # health, manufacturers, tiles, colors
│   ├── models/           # Manufacturer, Tile, Color
│   └── schemas/          # Pydantic response schemas
├── scripts/
│   └── seed_data.py      # Sample manufacturers/tiles/colors
├── requirements.txt
├── run.py
└── .env.example
```

---

## 3. Frontend Setup

### Install Dependencies

From the `frontend` directory, run these in order:

```bash
cd frontend
```

**Core Expo packages (camera, image picker, navigation):**

```bash
npx expo install expo-image-picker expo-camera
npx expo install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
```

**NativeWind (Tailwind for React Native):**

```bash
npx expo install nativewind tailwindcss@^3.4.17 react-native-reanimated react-native-safe-area-context
```

**Icons:**

```bash
npm install lucide-react-native react-native-svg
```

> **Note:** `react-native-safe-area-context` may already be installed with React Navigation; reinstalling is fine.

### Start the App

```bash
npx expo start
```

Use **Expo Go** on your device or press `i` (iOS) / `a` (Android) for a simulator.

### Frontend Folder Structure

```
frontend/
├── App.js                # Root component, imports global.css
├── index.js
├── global.css            # Tailwind directives (for NativeWind)
├── tailwind.config.js
├── babel.config.js
├── metro.config.js
├── nativewind-env.d.ts   # TypeScript types for NativeWind (optional)
├── app.json
├── assets/
├── src/
│   ├── components/       # Reusable UI (buttons, cards, etc.)
│   ├── screens/          # Screen components (Camera, SelectTile, etc.)
│   ├── navigation/       # Stack/tab navigators
│   ├── hooks/            # Custom hooks (useCamera, useApi, etc.)
│   ├── api/              # API client, endpoints
│   └── constants/        # API_BASE_URL, theme values
└── package.json
```

---

## 4. Dependency Overview

### Frontend Dependencies

| Package                       | Purpose                    |
|------------------------------|----------------------------|
| expo                         | Managed Expo workflow      |
| expo-image-picker            | Select images from library |
| expo-camera                  | Take photos with camera    |
| @react-navigation/native     | Navigation container       |
| @react-navigation/native-stack | Stack navigator         |
| react-native-screens         | Native screen components   |
| react-native-safe-area-context | Safe area handling      |
| nativewind                   | Tailwind for RN            |
| tailwindcss                  | Tailwind CSS               |
| react-native-reanimated      | Animations (NativeWind dep)|
| lucide-react-native          | Icons                      |
| react-native-svg             | SVG support (icons)        |

### Backend Dependencies

| Package           | Purpose                    |
|-------------------|----------------------------|
| fastapi           | Web framework              |
| uvicorn           | ASGI server                |
| sqlalchemy        | ORM                        |
| psycopg2-binary   | PostgreSQL driver          |
| alembic           | DB migrations              |
| pydantic          | Validation & schemas       |
| pydantic-settings | Settings from env          |
| python-multipart  | File uploads               |

---

## 5. Root .gitignore

The root `.gitignore` covers:

- `node_modules/`, `venv/`, `__pycache__/`
- `.expo/`, build outputs, IDE config
- `.env`, secrets, logs, databases
- Native build folders (`/ios`, `/android`)

---

## 6. Troubleshooting

### NativeWind styles not applying

- Run: `npx expo start --clear`
- Ensure `global.css` is imported in `App.js`
- Ensure `react-native-reanimated/plugin` is last in `babel.config.js` plugins

### Expo SDK 54 + NativeWind

Expo SDK 54 uses Reanimated v4. NativeWind v4.2+ is compatible. If you see style issues, try:

```bash
rm -rf node_modules && npm install
npx expo start --clear
```

### Android emulator / physical device

- Use your machine’s LAN IP in `src/constants/index.js` instead of `localhost` when testing on a device.
- Ensure backend is reachable on your network (e.g., firewall, port 8001).

---

## 7. Running Phase 1 (Selection Flow)

1. **Backend:** `cd backend && source venv/bin/activate && python -m scripts.seed_data && python run.py`
2. **Frontend:** `cd frontend && npx expo start --web` (or `npx expo start` for Expo Go)
3. Open http://localhost:8082 (web) or scan QR for mobile
4. Tap **Start Selection** → pick Manufacturer → Tile → Color

---

## 8. Next Steps

1. Phase 2: Camera + image upload
2. Phase 3: AI visualization (Gemini API)
