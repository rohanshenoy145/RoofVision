# RoofVision — Frontend

React Native app with Expo (managed workflow), NativeWind (Tailwind), React Navigation.

---

## Folder structure

```
frontend/
├── App.js                  # Entry: SafeAreaProvider, NavigationContainer, AppNavigator
├── index.js
├── global.css              # Tailwind directives for NativeWind
├── tailwind.config.js
├── babel.config.js
├── metro.config.js
├── app.json
├── assets/
└── src/
    ├── api/
    │   └── client.js        # fetch wrapper, api.getManufacturers(), etc.
    ├── constants/
    │   └── index.js         # API_BASE_URL (dev vs prod)
    ├── navigation/
    │   └── AppNavigator.js  # Stack: Home, Manufacturers, Tiles, Colors, AddPhoto
    ├── screens/
    │   ├── HomeScreen.js
    │   ├── ManufacturerListScreen.js
    │   ├── TileListScreen.js
    │   ├── ColorListScreen.js
    │   └── AddPhotoScreen.js   # Phase 2: pick/capture image, "Save to server"
    ├── components/         # (empty for now)
    └── hooks/              # (empty for now)
```

---

## App entry (App.js)

- **SafeAreaProvider** — safe areas on notched devices.
- **NavigationContainer** — React Navigation context.
- **AppNavigator** — root stack (all screens).
- **StatusBar** — light style for dark header.

---

## Navigation

**Stack:** Home → Manufacturers → Tiles → Colors → Add Photo.

| Screen | Route name | Params from previous |
|--------|------------|----------------------|
| Home | `Home` | — |
| Manufacturer list | `Manufacturers` | — |
| Tile list | `Tiles` | manufacturerId, manufacturerName |
| Color list | `Colors` | manufacturerId, manufacturerName, tileId, tileName |
| Add Photo | `AddPhoto` | manufacturerId, manufacturerName, tileId, tileName, colorId, colorName |

Params are passed via `navigation.navigate(...)` and read in the next screen with `route.params`.

---

## Screens

| Screen | Purpose |
|--------|--------|
| **HomeScreen** | Title, short description, "Start Selection" button → Manufacturers. |
| **ManufacturerListScreen** | GET /manufacturers, list; on tap → Tiles with manufacturerId. |
| **TileListScreen** | GET /manufacturers/:id/tiles, list; shows manufacturer name; on tap → Colors with tileId, manufacturerId. |
| **ColorListScreen** | GET /tiles/:id/colors, list with hex swatch; on tap → AddPhoto with full selection params. |
| **AddPhotoScreen** (Phase 2) | "Choose from library" / "Take photo" (expo-image-picker); compact 200px preview; "Save to server" uploads to POST /visualizations; success shows saved message and small thumbnail. |

Each list screen has loading (spinner) and error state (message if API fails).

---

## API client (src/api/client.js)

- Base URL from `src/constants/index.js` (e.g. `http://localhost:8001/api/v1` in dev).
- `request(path, options)` — fetch wrapper; throws on non-2xx; returns JSON.
- **api.getManufacturers()**
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
