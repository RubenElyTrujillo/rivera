# Room Visualizer — Design Spec
_Date: 2026-04-20_

## Overview

A dedicated page (`/visualizador`) where users can preview how flooring, wall, and ceiling materials from the Rivera catalog would look in a real room. Users can either pick from pre-designed room templates or upload their own photo. Once a room is loaded, material swapping is instantaneous via Canvas API.

---

## Goals

- Let potential buyers visualize materials in a real space before purchasing
- Reduce friction between browsing and buying via a WhatsApp CTA that includes the selected materials
- Provide instant visual feedback with no per-material-swap cost

---

## Surfaces

Users can change three surfaces independently:
- **Piso** (floor)
- **Pared** (wall)
- **Techo** (ceiling)

---

## Approach: Hybrid (Templates + AI Upload)

### Templates (instant)
Pre-designed room photos with pre-generated surface masks. No AI required at runtime. Available immediately on page load.

### User Photo Upload (AI-powered)
1. User uploads a room photo
2. Backend sends photo to **Replicate (SAM 2 — Segment Anything Model 2)**
3. AI returns three PNG masks: piso, pared, techo (~3–5 seconds, ~$0.002/photo)
4. Masks are saved alongside the photo; never re-processed
5. Material swapping after this point is instantaneous (Canvas API, client-side only)

### Manual Mask Correction
After AI segmentation, users can use a basic brush tool to correct misidentified surfaces before applying materials.

---

## Page Layout (`/visualizador`)

```
┌─────────────────────────────────────────────────────────┐
│  VISUALIZADOR DE ESPACIOS                               │
│  Elige una plantilla o sube tu foto                     │
│                                                         │
│  [Sala] [Recámara] [Baño] [Cocina]  [+ Subir mi foto]  │
│                                                         │
│  ┌──────────────────────────┐  ┌──────────────────────┐ │
│  │                          │  │ SUPERFICIE           │ │
│  │   Canvas Preview         │  │ ● Piso               │ │
│  │   (composite render)     │  │ ○ Pared              │ │
│  │                          │  │ ○ Techo              │ │
│  │                          │  │                      │ │
│  │                          │  │ MATERIALES           │ │
│  │                          │  │ [filtro: Pisos/       │ │
│  │                          │  │  Paredes/Techos]     │ │
│  │                          │  │                      │ │
│  └──────────────────────────┘  │ [grid de texturas]   │ │
│                                │                      │ │
│                                │ [Me interesa →]      │ │
│                                └──────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

Panel de materiales posicionado a la **derecha** de la imagen.

---

## WhatsApp CTA

Button: **"Me interesa este material"**

Sends a pre-filled WhatsApp message to the Rivera contact number containing:
- Room name/type
- Selected material per surface (piso, pared, techo)
- Link back to the visualizer (optional)

Example message:
```
Hola, estoy viendo materiales en el visualizador de Rivera.
- Piso: Piso Laminado Clásico Select
- Pared: WPC Muro Interior Blanco
- Techo: (sin selección)
Me gustaría recibir más información.
```

---

## Data Model

### `RoomTemplate` (new Prisma model)
| Field | Type | Notes |
|-------|------|-------|
| `id` | Int | PK |
| `name` | String | e.g. "Sala moderna" |
| `category` | String | sala, recámara, baño, cocina |
| `imageUrl` | String | Base room photo |
| `maskFloorUrl` | String? | PNG mask for floor |
| `maskWallUrl` | String? | PNG mask for wall |
| `maskCeilingUrl` | String? | PNG mask for ceiling |
| `order` | Int | Display order |
| `active` | Boolean | Show/hide in visualizer |
| `createdAt` | DateTime | |

### Materials / Textures
Materials come from the existing product catalog. Each product that should appear in the visualizer needs a **tileable texture image** (`textureUrl` field to be added to the `Product` model or as a separate field).

### `VisualizerSession` (client-side only, localStorage)
- `templateId` or `uploadedPhotoUrl`
- `maskFloorUrl`, `maskWallUrl`, `maskCeilingUrl`
- `selectedMaterials: { floor?: Product, wall?: Product, ceiling?: Product }`

No server-side session persistence needed — the visualizer is stateless.

---

## Canvas Rendering

1. Draw base room photo as background layer
2. For each surface with a selected material:
   - Load the material texture
   - Clip the texture to the surface mask (PNG alpha channel)
   - Composite using `multiply` or `overlay` blend mode to preserve room lighting/shadows
3. Result is drawn to `<canvas>` element in real time

All rendering happens client-side. No server calls after masks are loaded.

---

## AI Integration (Replicate)

- **Model:** `meta/sam-2` on Replicate (or equivalent segmentation model)
- **Trigger:** User uploads a photo via `/api/visualizer/segment`
- **Input:** Image file (uploaded to `/public/uploads/` or cloud storage)
- **Output:** Three binary PNG masks saved to storage
- **Cost:** ~$0.002 per image, billed to Rivera's Replicate account
- **Fallback:** If segmentation fails, show error and suggest using a template

API route: `POST /api/visualizer/segment`
- Accepts: `multipart/form-data` with `photo` field
- Returns: `{ maskFloor, maskWall, maskCeiling }` (URLs to saved PNG files)

---

## Admin: `/admin/room-templates`

- List all templates (active/inactive)
- Create new template: upload base image, trigger mask generation, review masks
- Edit template: rename, reorder, toggle active
- Delete template

Mask generation in admin is also done via the same `/api/visualizer/segment` endpoint.

Admin can manually override any mask by re-uploading a custom PNG.

---

## Product Texture Field

To make a product usable in the visualizer, it needs a tileable texture image. A `textureUrl` field will be added to the `Product` model (nullable). Products without a `textureUrl` do not appear in the visualizer material selector.

Admin product editing page will include a "Textura para visualizador" upload field.

---

## Navigation

- Add "Visualizador" link to the main navigation
- Consider a prominent CTA on the homepage (e.g., a banner section)

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| AI segmentation fails | Show error toast + suggest picking a template |
| Texture fails to load | Show placeholder + log error |
| No surfaces detected | Show warning + let user draw masks manually |
| User uploads non-photo | Validate file type + show helpful error |

---

## Out of Scope (v1)

- Saving/sharing visualizations as images (download)
- Multiple rooms simultaneously
- 3D rendering
- Mobile camera capture (file upload only in v1)
- Pricing integration

---

## Implementation Notes

- Use `fabric.js` or raw Canvas API for compositing — raw Canvas preferred to avoid bundle size
- Texture tiling: use `ctx.createPattern(textureImage, 'repeat')` then clip to mask
- Replicate API key stored in `.env` as `REPLICATE_API_KEY`
- All uploaded user photos are temporary (not persisted beyond the session)
