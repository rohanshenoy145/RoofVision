# RoofVision — API Reference

Base URL: `http://localhost:8001/api/v1` (or your backend host).

All list endpoints return JSON arrays. 404 returned when a parent resource does not exist.

---

## Health

### GET /health

Check that the API is up.

**Response:** `200 OK`

```json
{
  "status": "ok",
  "service": "RoofVision API"
}
```

---

## Manufacturers

### GET /manufacturers

List all manufacturers. Ordered by name.

**Response:** `200 OK`

```json
[
  { "id": 1, "name": "GAF", "slug": "gaf" },
  { "id": 2, "name": "CertainTeed", "slug": "certainteed" }
]
```

---

## Tiles

### GET /manufacturers/{manufacturer_id}/tiles

List tiles for a manufacturer.

**Parameters:**

| Name | Type | Location | Description |
|------|------|----------|-------------|
| manufacturer_id | integer | path | Manufacturer PK |

**Response:** `200 OK`

```json
[
  { "id": 1, "manufacturer_id": 1, "name": "Timberline HDZ", "slug": "timberline-hdz" },
  { "id": 2, "manufacturer_id": 1, "name": "Landmark", "slug": "landmark" }
]
```

**Errors:**

- `404 Not Found` — No manufacturer with that id.

---

## Colors

### GET /tiles/{tile_id}/colors

List colors for a tile.

**Parameters:**

| Name | Type | Location | Description |
|------|------|----------|-------------|
| tile_id | integer | path | Tile PK |

**Response:** `200 OK`

```json
[
  { "id": 1, "tile_id": 1, "name": "Weathered Wood", "hex_code": "#8B7355", "image_url": null },
  { "id": 2, "tile_id": 1, "name": "Charcoal", "hex_code": "#4A4A4A", "image_url": null }
]
```

**Errors:**

- `404 Not Found` — No tile with that id.

---

## Visualizations (Phase 2 + 3)

### POST /visualizations

Upload a house image with manufacturer/tile/color selection. Image is stored in `backend/uploads/`. **Phase 3:** Generation (mock or Gemini API) runs in the background. Poll `GET /visualizations/{id}` for status and `result_url`.

**Request:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | Yes | Image (JPEG, PNG, or WebP). Max 10MB. |
| manufacturer_id | integer | Yes | Manufacturer PK. |
| tile_id | integer | Yes | Tile PK. |
| color_id | integer | Yes | Color PK. |

**Response:** `201`

```json
{
  "id": 1,
  "image_path": "abc123.jpg",
  "image_url": "/api/v1/uploads/abc123.jpg",
  "manufacturer_id": 1,
  "tile_id": 1,
  "color_id": 1,
  "status": "pending",
  "result_url": null,
  "error_message": null,
  "created_at": "2025-02-08T12:00:00Z"
}
```

**Errors:** `400` for invalid file type or file too large.

---

### GET /visualizations/{id}

Get job status and result. Poll until `status` is `completed` or `failed`.

**Response:** `200`

```json
{
  "id": 1,
  "image_path": "abc123.jpg",
  "image_url": "/api/v1/uploads/abc123.jpg",
  "manufacturer_id": 1,
  "tile_id": 1,
  "color_id": 1,
  "status": "completed",
  "result_url": "/api/v1/uploads/result_1.png",
  "error_message": null,
  "created_at": "2025-02-08T12:00:00Z"
}
```

When `status` is `failed`, `error_message` is set. When `status` is `completed`, `result_url` is the path to the generated image.

**Errors:** `404` if visualization not found.

---

**Serving images:** `GET /api/v1/uploads/{filename}` serves both input and result files.

---

## Interactive docs

- **Swagger UI:** http://localhost:8001/docs  
- **ReDoc:** http://localhost:8001/redoc  

Use these to call endpoints from the browser when the backend is running.
