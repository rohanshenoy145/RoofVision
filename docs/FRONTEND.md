# RoofVision — Frontend

React Native app with Expo (managed workflow), NativeWind (Tailwind), React Navigation.

---

## Folder structure

```
frontend/
├── App.js                  # Entry: SafeAreaProvider, AuthProvider, NavigationContainer, RootNavigator
├── index.js
├── global.css              # Tailwind directives for NativeWind
├── tailwind.config.js
├── babel.config.js
├── metro.config.js
├── app.json
├── eas.json                # EAS Build profiles (dev / preview / production)
├── assets/
└── src/
    ├── api/
    │   └── client.js        # fetch wrapper, api.getManufacturers(), etc.
    ├── constants/
    │   ├── index.js         # API_BASE_URL (localhost web export, dev, env override)
    │   ├── copy.js          # Shared disclaimers / product copy
    │   └── flags.js         # EXPO_PUBLIC_HIDE_DEMO_GOOGLE, privacy policy URL
    ├── context/
    │   └── AuthContext.js   # Session + onboarding flags (AsyncStorage)
    ├── navigation/
    │   ├── RootNavigator.js # Auth → Onboarding → AppNavigator
    │   └── AppNavigator.js  # Stack: Home … Result, Settings
    ├── screens/
    │   ├── HomeScreen.js
    │   ├── MaterialScreen.js
    │   ├── ManufacturerListScreen.js
    │   ├── TileListScreen.js
    │   ├── ColorListScreen.js
    │   ├── AddPhotoScreen.js
    │   ├── ResultScreen.js
    │   ├── AuthScreen.js
    │   ├── OnboardingScreen.js
    │   └── SettingsScreen.js
    ├── components/
    │   └── ComparePreviewModal.js
    ├── utils/
    │   ├── imageQuality.js  # Heuristic input-quality (no ML)
    │   └── networkError.js # formatApiError for catalog screens
    └── hooks/              # (empty for now)
```

---

## App entry (App.js)

- **SafeAreaProvider** — safe areas on notched devices.
- **AuthProvider** — loads/saves `user` + `onboardingComplete` via `@react-native-async-storage/async-storage`.
- **NavigationContainer** — React Navigation context.
- **RootNavigator** — splash while hydrating → **AuthScreen** if no user → **OnboardingScreen** if not accepted → **AppNavigator**.
- **StatusBar** — light style for dark header.

---

## Navigation

**Stack (main):** Home → Material → Manufacturers → Tiles → Colors → Add Photo → Result. **Settings** is an extra stack screen (⚙︎ on Home header).

| Screen | Route name | Params from previous |
|--------|------------|----------------------|
| Home | `Home` | — |
| Material | `Material` | — |
| Manufacturer list | `Manufacturers` | `materialType`, `materialLabel` |
| Tile list | `Tiles` | manufacturerId, manufacturerName |
| Color list | `Colors` | manufacturerId, manufacturerName, tileId, tileName |
| Add Photo | `AddPhoto` | manufacturerId, manufacturerName, tileId, tileName, colorId, colorName |
| Result | `Result` | `visualizationId`, names, IDs for retry, optional **`inputQuality`** (`level`, `summary`, `tips`, …) |
| Settings | `Settings` | — |

Params are passed via `navigation.navigate(...)` and read in the next screen with `route.params`.

---

## Screens

| Screen | Purpose |
|--------|--------|
| **HomeScreen** | Hero + value props + CTA → Material; short **AI preview** disclaimer in hero. |
| **AuthScreen** | Demo Google stub + guest; demo hidden when `EXPO_PUBLIC_HIDE_DEMO_GOOGLE=1` (see `eas.json` preview/production). |
| **OnboardingScreen** | First-run compliance / expectations; “I understand” persists. |
| **SettingsScreen** | Signed-in summary, About, draft privacy note, optional **Open privacy policy** (`EXPO_PUBLIC_PRIVACY_POLICY_URL`), sign out. |
| **MaterialScreen** | Choose tile/shingle/metal → Manufacturers with `materialType` filter. |
| **ManufacturerListScreen** | GET /manufacturers?material_type=…; on tap → Tiles; empty state if none. |
| **TileListScreen** | GET /manufacturers/:id/tiles, list; shows manufacturer name; on tap → Colors with tileId, manufacturerId. |
| **ColorListScreen** | GET /tiles/:id/colors, list with hex swatch; on tap → AddPhoto with full selection params. |
| **AddPhotoScreen** | Library / camera (device); preview; **photo quality** banner from `evaluateImageQuality(asset)`; **Generate** uploads then navigates with `inputQuality`. |
| **ResultScreen** | Polls job; compare UI; **Save** — web download; iOS/Android save to **photo library** (`expo-file-system` + `expo-media-library`) with fallbacks. |

Each list screen has loading (spinner) and error state (message if API fails).

---

## API client (src/api/client.js)

- Base URL from `src/constants/index.js` (e.g. `http://localhost:8001/api/v1` in dev).
- `request(path, options)` — fetch wrapper; throws on non-2xx; returns JSON.
- **api.getManufacturers(materialType?)** — optional query for material-first flow
- **api.getTilesByManufacturer(manufacturerId)**
- **api.getColorsByTile(tileId)**
- **api.uploadVisualization(imageUri, manufacturerId, tileId, colorId)** — multipart POST to /visualizations; handles blob URIs on web.
- **getUploadBaseUrl()** — returns backend origin (no /api/v1) for building full image URLs (e.g. saved upload thumbnail).

For a physical device, set `API_BASE_URL` to your machine’s LAN IP.

---

## Styling

- **NativeWind** — Tailwind-style `className` on React Native components.
- **global.css** — `@tailwind base/components/utilities`; imported in App.js.
- **tailwind.config.js** — content paths: App.js, src/**.

---

## Running

```bash
cd frontend
npm install
npx expo start --web --port 8083
```

- Web: http://localhost:8083  
- Expo Go: scan QR from terminal (use Expo Go app, not Camera).
