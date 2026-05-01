# Phase 1 — Catalog & selection flow

**Status:** ✅ Completed

---

## Goal

User can open the app and walk through **manufacturer → tile → color** without taking a photo or generating anything yet.

---

## What was built

- **Backend:** Models (Manufacturer, Tile, Color), Pydantic schemas, API: `GET /manufacturers`, `GET /manufacturers/{id}/tiles`, `GET /tiles/{id}/colors`. Seed script for sample data. SQLite/PostgreSQL, table creation on startup.
- **Frontend:** Home screen, Manufacturer list, Tile list, Color list. Stack navigation. API client. Loading and error states. NativeWind styling. Web + Expo Go.

---

## Key files

- Backend: `app/models/`, `app/schemas/`, `app/api/manufacturers.py`, `tiles.py`, `colors.py`, `scripts/seed_data.py`
- Frontend: `src/screens/HomeScreen.js`, `ManufacturerListScreen.js`, `TileListScreen.js`, `ColorListScreen.js`, `src/navigation/AppNavigator.js`, `src/api/client.js`

---

## Reference

See [ROADMAP.md](../ROADMAP.md) and [FEATURES.md](../FEATURES.md) for full feature lists.
