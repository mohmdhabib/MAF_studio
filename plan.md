# MAF Studio

> **AI-native, browser-based motion graphics editor.**  
> Describe an animation in plain English — get a fully animated, editable scene exportable as MP4, WebM, GIF, GSAP, CSS, Framer Motion, or Lottie JSON.

![Stack](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![Lang](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![AI](https://img.shields.io/badge/Claude-Sonnet-orange?logo=anthropic) ![DB](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase) ![License](https://img.shields.io/badge/License-Open--Source%20First-brightgreen)

---

## Table of Contents

1. [Product Overview & Vision](#1-product-overview--vision)
2. [Tech Stack](#2-tech-stack--free--open-source-first)
3. [Folder Structure](#3-folder-structure)
4. [System Architecture](#4-system-architecture)
5. [Database Schema](#5-database-schema-postgresql-via-supabase)
6. [API Endpoints](#6-api-endpoints--full-reference)
7. [MAF JSON Schema v0.3](#7-maf-json-schema-v03--the-intermediate-representation)
8. [AI Integration](#8-ai-integration--how-claude-powers-the-editor)
9. [Frontend Component Architecture](#9-frontend-component-architecture)
10. [Authentication & Authorization](#10-authentication--authorization)
11. [Video Export Pipeline](#11-video-export-pipeline)
12. [Edge Cases & Resolutions](#12-edge-cases--how-to-resolve-them)
13. [Environment Variables](#13-environment-variables--configuration)
14. [Deployment](#14-deployment--zero-cost-infrastructure)
15. [Testing Strategy](#15-testing-strategy)
16. [Production Launch Checklist](#16-production-launch-checklist)
17. [Roadmap](#17-roadmap--future-features)

---

## 1. Product Overview & Vision

MAF Studio is an AI-native, browser-based motion graphics editor. Users describe an animation in plain English and receive a fully animated, editable scene — exportable as MP4, WebM, GIF, GSAP code, CSS `@keyframes`, Framer Motion TSX, or Lottie JSON.

### Core Differentiator

Competitors generate either uneditable pixels (Runway, Pika) or rigid templates (Jitter, Canva). MAF Studio generates a structured JSON Intermediate Representation — the **Motion Animation Format (MAF)** — which the renderer consumes directly. This decouples AI from pixels, making every output fully editable, and enables one-source multi-format export.

### Target Users

| User | Use Case |
|---|---|
| **Marketers / Social Teams** | Animated posts, lower-thirds, product reveals without After Effects. |
| **Frontend Developers** | Prompt UI animations, export working GSAP or Framer Motion code, paste into project. |
| **Designers** | Import Figma frames via plugin, add motion, export for handoff. |
| **Solo Founders / Indie Creators** | Professional motion graphics without hiring a motion designer. |

---

## 2. Tech Stack — Free / Open-Source First

Every technology below has a free tier or is fully open-source. Paid costs only begin when you scale past the free limits.

| Layer | Technology | Why / Free Tier |
|---|---|---|
| Frontend framework | Next.js 14 (App Router) | Free, open-source. Vercel free tier: 100 GB bandwidth/mo. |
| Language | TypeScript 5 | Free, open-source. Zero runtime cost. |
| UI components | shadcn/ui + Tailwind CSS | Free, open-source. Copy-paste components, no subscription. |
| State management | Zustand | Free, lightweight. Replaces Redux without boilerplate. |
| Animation canvas | HTML5 Canvas 2D API | Native browser API. Zero cost. |
| AI — Primary | Anthropic Claude Sonnet API | Pay-per-token. ~$0.003/generation. Free via API trial credits. |
| AI — Local/Free | Ollama + Llama 3.1 (8B) | Fully free. Runs on user's machine. No API cost. |
| Database | Supabase (PostgreSQL) | Free tier: 500 MB DB, 1 GB storage, 50 K MAU. |
| Auth | Supabase Auth | Free tier included. Google OAuth, magic link. |
| File storage | Supabase Storage | Free tier: 1 GB. For uploaded SVG/PNG assets. |
| Video encoding | ffmpeg.wasm | Free, open-source. Runs in browser — zero server cost. |
| Backend API | Next.js API Routes / Edge Functions | Free on Vercel. Serverless, no server to manage. |
| Hosting | Vercel | Free tier: unlimited deployments, 100 GB bandwidth. |
| Figma plugin | Figma Plugin API (vanilla JS) | Free. Figma allows free plugin publishing. |
| Animations | GSAP (GreenSock) | Free for non-commercial use. Club subscription for advanced. |
| Code quality | ESLint + Prettier + Husky | Free, open-source. |
| Testing | Vitest + Playwright | Free, open-source. |
| Monitoring | Vercel Analytics + Sentry free tier | Free tiers for both. |

---

## 3. Folder Structure

The project is a Next.js 14 monorepo with the App Router. The Figma plugin lives in a separate subfolder and is deployed independently.

```
maf-studio/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx        # Login page
│   │   └── callback/route.ts     # Auth callback
│   ├── (dashboard)/
│   │   ├── page.tsx              # Dashboard
│   │   └── layout.tsx
│   ├── editor/
│   │   ├── page.tsx              # Main editor
│   │   ├── [sceneId]/page.tsx    # Load scene
│   │   └── layout.tsx
│   ├── api/
│   │   ├── ai/
│   │   │   ├── generate/route.ts # AI generate
│   │   │   └── edit/route.ts     # AI edit
│   │   ├── scenes/
│   │   │   ├── route.ts          # CRUD
│   │   │   └── [id]/route.ts
│   │   └── exports/route.ts
│   ├── layout.tsx
│   └── globals.css
└── src/
    ├── schema/maf.ts             # TypeScript types
    ├── store/
    │   ├── scene.ts              # Zustand state
    │   └── ui.ts
    ├── renderer/
    │   ├── engine.ts             # Canvas rendering
    │   ├── interpolate.ts
    │   ├── easings.ts
    │   ├── fill.ts
    │   ├── particles.ts
    │   └── path.ts
    ├── ai/
    │   ├── generate.ts
    │   ├── ollama.ts
    │   ├── prompts.ts
    │   └── normalize.ts
    ├── export/
    │   ├── video.ts              # ffmpeg.wasm
    │   ├── frameCapture.ts
    │   ├── gsap.ts
    │   ├── css.ts
    │   ├── framer.ts
    │   ├── lottie.ts
    │   └── fillUtils.ts
    ├── components/editor/
    └── utils/
```

---

## 4. System Architecture

The entire system is organized around one invariant: **MAF JSON is the single source of truth**. Every layer of the stack either reads or writes to this JSON. Nothing else.

| # | Layer | Description |
|---|---|---|
| 1 | **User input** | Natural language prompt · Canvas drag · Timeline scrub · Properties panel · Direct JSON edit |
| 2 | **Next.js API layer** | Edge Functions (`/api/ai/*`) — proxy between browser and Claude API. Handles auth, rate limiting, API key protection. |
| 3 | **AI layer (Claude Sonnet)** | Reads MAF schema as context → outputs MAF JSON only → auto-repair on malformed JSON. |
| 4 | **MAF JSON — single source of truth** | Zustand store (browser) + Supabase PostgreSQL (cloud). All mutations (AI, drag, slider) write here. Undo/redo via snapshot history. |
| 5 | **Canvas 2D renderer** | Pure function: `render(ctx, scene, time) → void`. 60 fps rAF loop. Same function used for live preview and video export. |
| 6 | **Export layer** | Video: `frameCapture` → `ffmpeg.wasm` → MP4/WebM/GIF. Code: `gsap.ts` / `css.ts` / `framer.ts` / `lottie.ts` |
| 7 | **Supabase** | PostgreSQL (scenes, users, exports), Auth (sessions), Storage (uploaded assets). |

---

## 5. Database Schema (PostgreSQL via Supabase)

All tables use Supabase's built-in `auth.users` for authentication. Row Level Security (RLS) is enabled on all tables — users can only access their own data.

### `profiles`

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
  -- Rate limiting counters (reset daily via cron job)
  ai_gens_today INTEGER DEFAULT 0,
  exports_today INTEGER DEFAULT 0,
  ai_gen_limit INTEGER DEFAULT 10,   -- free: 10, pro: 100, team: unlimited
  export_limit INTEGER DEFAULT 5,    -- free: 5, pro: 50, team: unlimited
  limits_reset_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
```

### `scenes`

```sql
CREATE TABLE public.scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Scene',
  description TEXT,
  maf_json JSONB NOT NULL,        -- Full MAF scene object
  thumbnail_url TEXT,             -- Supabase Storage URL (first frame PNG)
  duration_ms INTEGER,            -- Cached from maf_json.meta.duration
  is_public BOOLEAN DEFAULT false,-- Future: community gallery
  tags TEXT[] DEFAULT '{}',
  preset_id TEXT,                 -- If created from a preset
  version TEXT DEFAULT '0.3',     -- MAF schema version
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_scenes_user_id ON public.scenes(user_id);
CREATE INDEX idx_scenes_updated_at ON public.scenes(updated_at DESC);
CREATE INDEX idx_scenes_maf_json ON public.scenes USING gin(maf_json);

ALTER TABLE public.scenes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own scenes" ON public.scenes
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view public scenes" ON public.scenes
  FOR SELECT USING (is_public = true);
```

### `ai_generations` (audit + analytics)

```sql
CREATE TABLE public.ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES public.scenes(id) ON DELETE SET NULL,
  mode TEXT NOT NULL CHECK (mode IN ('generate', 'edit')),
  prompt TEXT NOT NULL,
  model TEXT NOT NULL,            -- 'claude-sonnet-4-6' or 'ollama/llama3.1'
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_usd NUMERIC(10, 6),
  success BOOLEAN DEFAULT true,
  error_msg TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_gens_user_id ON public.ai_generations(user_id);
CREATE INDEX idx_ai_gens_created_at ON public.ai_generations(created_at DESC);
```

### `exports` (audit + analytics)

```sql
CREATE TABLE public.exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES public.scenes(id) ON DELETE SET NULL,
  format TEXT NOT NULL CHECK (format IN ('mp4','webm','gif','gsap','css','framer','lottie')),
  width INTEGER,
  height INTEGER,
  fps INTEGER,
  duration_ms INTEGER,
  file_size_kb INTEGER,
  success BOOLEAN DEFAULT true,
  error_msg TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `assets` (uploaded SVG/PNG files)

```sql
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,     -- Supabase Storage path
  public_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_kb INTEGER,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own assets" ON public.assets
  FOR ALL USING (auth.uid() = user_id);
```

---

## 6. API Endpoints — Full Reference

All endpoints require `Authorization: Bearer {supabase_jwt}` header except where noted. All endpoints return JSON. All write operations include CSRF protection via Next.js defaults.

### AI Generation Endpoints

#### `POST /api/ai/generate`

Generate a complete new MAF scene from a natural language prompt. This proxies the Claude API — the API key never leaves the server.

```jsonc
// Request body
{
  "prompt": "A glowing gradient title that staggers in letter by letter",
  "model": "claude-sonnet-4-6",   // optional, defaults to claude-sonnet-4-6
  "canvas": {                      // optional, defaults to 800x450
    "width": 800,
    "height": 450
  }
}

// Success response (200)
{
  "scene": { ...MAF JSON object... },
  "model": "claude-sonnet-4-6",
  "usage": {
    "input_tokens": 4215,
    "output_tokens": 892,
    "cost_usd": 0.00312
  }
}

// Error responses
// 429 — { "error": "rate_limit", "remaining": 0, "reset_at": "2024-01-01T00:00:00Z" }
// 422 — { "error": "invalid_scene", "details": "AI returned malformed JSON after repair" }
// 500 — { "error": "ai_error", "message": "..." }
```

#### `POST /api/ai/edit`

Edit an existing MAF scene based on a prompt. The current scene is sent as context; only changed fields are returned and deep-merged client-side.

```jsonc
// Request body
{
  "prompt": "Make it faster and change the glow color to pink",
  "current_scene": { ...MAF JSON object... },
  "model": "claude-sonnet-4-6"
}

// Success response (200)
{
  "patch": { ...partial MAF JSON (only changed fields)... },
  "model": "claude-sonnet-4-6",
  "usage": { "input_tokens": 5100, "output_tokens": 340, "cost_usd": 0.0021 }
}
```

### Scene CRUD Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/scenes` | Required | List current user's scenes. Params: `?page=1&limit=20&sort=updated_at` |
| `POST` | `/api/scenes` | Required | Create a new scene. Body: `{ name, maf_json, description?, tags? }` |
| `GET` | `/api/scenes/:id` | Required (own) / Optional (public) | Get a single scene by ID. |
| `PUT` | `/api/scenes/:id` | Required (owner only) | Update scene. Body: partial `{ name, maf_json, description, is_public, tags }` |
| `DELETE` | `/api/scenes/:id` | Required (owner only) | Delete scene and thumbnail from storage. |
| `POST` | `/api/scenes/:id/thumbnail` | Required | Upload a generated thumbnail PNG. Body: `multipart/form-data` |

#### `GET /api/scenes` — Full Response

```jsonc
// Response (200)
{
  "scenes": [
    {
      "id": "uuid",
      "name": "Neon Logo Reveal",
      "description": "...",
      "thumbnail_url": "https://...",
      "duration_ms": 2000,
      "tags": ["logo", "neon"],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

#### `POST /api/exports` (log export)

```jsonc
// Video export happens 100% client-side via ffmpeg.wasm — no server needed.
// This endpoint only logs the export event for analytics and rate limiting.
// Request body
{
  "scene_id": "uuid",   // optional if scene not yet saved
  "format": "mp4",
  "width": 800,
  "height": 450,
  "fps": 60,
  "duration_ms": 2000,
  "file_size_kb": 1240,
  "success": true
}
```

---

## 7. MAF JSON Schema v0.3 — The Intermediate Representation

The MAF schema is intentionally **AI-readable first**. Every field is a real English word. No opaque renderer codes (unlike Lottie's `"ty"`, `"ks"`, `"ip"`). The AI never has to guess — it reads the schema as part of its system prompt.

### Top-Level Scene Object

```typescript
// Full TypeScript type — src/schema/maf.ts
interface MAFScene {
  version: "0.3";
  meta: {
    name: string;
    duration: number;           // total duration in milliseconds
    fps: number;                // 24, 30, or 60
    canvas: {
      width: number;            // pixels — default 800
      height: number;           // pixels — default 450
    };
    background: Fill;           // solid color or gradient
    description: string;        // AI-generated description of the scene intent
  };
  assets: Asset[];              // uploaded SVG/PNG (base64 embedded)
  layers: Layer[];              // all visible elements — main content
  compositions: Composition[];  // named groups (for future precomps)
  camera?: Camera;              // optional scene-level pan/zoom
  intent?: string;              // human-readable description of desired feel
}
```

### Layer Types

```typescript
type Layer = RectLayer | CircleLayer | TextLayer | SVGLayer | PathLayer | ParticleLayer;

// Common fields on every layer:
interface BaseLayer {
  id: string;            // unique, e.g. "layer-1"
  type: LayerType;
  name: string;          // display name in the layer panel
  visible: boolean;
  locked: boolean;
  opacity: number;       // 0-1, can be animated via keyframes
  blendMode: BlendMode;  // 'normal' | 'screen' | 'multiply' | 'overlay' | 'add'
  transform: {
    x: number;           // position X — canvas center is 400 for 800px wide
    y: number;           // position Y — canvas center is 225 for 450px tall
    width: number;
    height: number;
    rotation: number;    // degrees
    scale: { x: number; y: number; };
    anchor: {            // pivot point, 0.5/0.5 = center
      x: number;
      y: number;
    };
  };
  keyframes: Keyframe[];
  loop?: {
    enabled: boolean;
    start: number;       // ms
    end: number;         // ms
    count: number | 'infinite';
    pingPong: boolean;
  };
  motionPath?: {
    pathData: string;    // SVG path d="..."
    autoRotate: boolean;
    offset: number;      // 0-1 start position
  };
  clipMask?: {
    type: 'rect' | 'circle' | 'path';
    data: string;
  };
}

// Rect layer
interface RectLayer extends BaseLayer {
  type: 'rect';
  style: {
    fill: Fill;
    borderRadius: number;
    stroke?: string;
    strokeWidth?: number;
    shadow?: { color: string; blur: number; offsetX: number; offsetY: number; };
    glow?: number;         // glow halo strength (0-100)
    blur?: number;         // gaussian blur
  };
}

// Text layer
interface TextLayer extends BaseLayer {
  type: 'text';
  content: string;
  style: {
    fill: Fill;
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    textAlign: 'left' | 'center' | 'right';
    letterSpacing: number;
    lineHeight: number;
    animation?: {          // Per-character / word / line stagger
      type: 'character' | 'word' | 'line';
      stagger: number;     // ms delay between each unit
      direction: 'forward' | 'backward' | 'random';
    };
  };
}

// Particle layer
interface ParticleLayer extends BaseLayer {
  type: 'particles';
  config: {
    count: number;         // number of particles
    spread: number;        // spawn radius in px
    speed: number;         // px/s base speed
    size: number;          // px base radius
    lifetime: number;      // ms per particle
    gravity: number;       // px/s² downward force
    colors: string[];      // palette (random pick per particle)
    shape: 'circle' | 'rect' | 'star';
    emitRate: number;      // particles per second
    seed: number;          // deterministic PRNG seed
  };
}
```

### Keyframe Structure

```typescript
interface Keyframe {
  time: number;           // milliseconds from scene start
  easing: EasingName;     // applied from previous keyframe to this one
  properties: {
    opacity?: number;
    position?: { x: number; y: number; };
    scale?: { x: number; y: number; };
    rotation?: number;
    fill?: Fill;           // can animate between solid colors
    blur?: number;
    glow?: number;
    pathProgress?: number; // 0-1, for motion path animation
    strokeWidth?: number;
    fontSize?: number;
    letterSpacing?: number;
  };
}

type EasingName =
  | 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad'
  | 'easeOutCubic' | 'easeInCubic' | 'easeOutBack' | 'easeInBack'
  | 'easeOutBounce' | 'spring' | 'easeOutElastic' | 'easeInElastic';
```

### Fill — Solid or Gradient

```typescript
type Fill = string | LinearGradientFill | RadialGradientFill;

// Solid: just a CSS hex color
"fill": "#6c63ff"

// Linear gradient
"fill": {
  "type": "linear",
  "angle": 135,
  "stops": [
    { "offset": 0, "color": "#a855f7" },
    { "offset": 0.5, "color": "#6c63ff" },
    { "offset": 1, "color": "#3b82f6" }
  ]
}

// Radial gradient (great for glows)
"fill": {
  "type": "radial",
  "stops": [
    { "offset": 0, "color": "#ffffff" },
    { "offset": 1, "color": "#6c63ff00" }  // "00" suffix = fully transparent
  ]
}
```

---

## 8. AI Integration — How Claude Powers the Editor

### Model Selection

| Model | Use Case | Cost / 1K Tokens | Quality |
|---|---|---|---|
| `claude-sonnet-4-6` | Default for all production users | $0.003 in / $0.015 out | Excellent — handles complex gradients, particles, nested keyframes |
| `claude-haiku-4-5` | Optional: low-cost mode (future) | $0.00025 in / $0.00125 out | Good for simple scenes, struggles with particle configs |
| `ollama llama3.1:8b` | "Bring your own compute" power users | Free (local) | Inconsistent. Good for simple rect/text scenes only. |

### System Prompt Architecture

The system prompt is assembled in `src/ai/prompts.ts`. It is approximately **4,000 tokens** and includes:

- The complete MAF v0.3 schema documentation (every field, every type, every allowed value)
- A full worked example scene (logo reveal with gradient, glow, character stagger)
- Strict generation rules (canvas center = 400,225; always use spring easing; minimum 2 keyframes per layer; use gradients not flat colors; use glow on key elements)
- Output format instruction: respond with **ONLY raw JSON**, no markdown, no prose
- Quality rules: vibrant colors, 60 fps keyframe density, use particles for emphasis, never generate grey boxes

### Generation Pipeline (`src/ai/generate.ts`)

```typescript
// Simplified implementation of generateScene()
export async function generateScene(
  prompt: string,
  options: { model?: string; canvas?: { width: number; height: number } }
): Promise<MAFScene> {
  // 1. Assemble system prompt (schema docs + example + rules)
  const systemPrompt = buildSystemPrompt(options.canvas);

  // 2. Call Claude API via Next.js Edge Function (POST /api/ai/generate)
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseSession.access_token}`
    },
    body: JSON.stringify({ prompt, model: options.model, canvas: options.canvas })
  });

  // 3. Edge Function calls Claude:
  // const claude = new Anthropic();
  // const msg = await claude.messages.create({
  //   model: 'claude-sonnet-4-6',
  //   max_tokens: 4096,
  //   temperature: 0.7,
  //   system: systemPrompt,
  //   messages: [{ role: 'user', content: prompt }]
  // });

  // 4. Extract JSON from response (handles prose wrapping from local models)
  const rawText = response.content[0].text;
  const jsonStr = extractJson(rawText);  // finds first balanced {...}

  // 5. Parse
  let scene: MAFScene;
  try {
    scene = JSON.parse(jsonStr);
  } catch (e) {
    // 6. Auto-repair: ask Claude to fix its own broken JSON
    scene = await repairJson(jsonStr, options.model);
  }

  // 7. Fill in missing fields with safe defaults
  scene = normalizeScene(scene, options.canvas);
  return scene;
}
```

### Edit Mode (Patch)

```typescript
// editScene() — sends current scene as context, gets back only changed fields
export async function editScene(
  prompt: string,
  currentScene: MAFScene,
  model?: string
): Promise<MAFScene> {
  // Temperature 0.5 for edit mode (more deterministic than generate)
  // System prompt includes instruction to return ONLY the changed fields as JSON
  // E.g., if user says "make it faster", only timing fields should change
  const patch = await callClaudeEdit(prompt, currentScene, model);
  // Deep merge patch into current scene
  return deepMerge(currentScene, patch);
}
```

### `normalizeScene()` — Defensive Defaults

This function runs on every AI response before the scene reaches the renderer. It prevents crashes on missing fields.

```typescript
function normalizeScene(raw: any, canvas?: { width: number; height: number }): MAFScene {
  const w = canvas?.width ?? raw?.meta?.canvas?.width ?? 800;
  const h = canvas?.height ?? raw?.meta?.canvas?.height ?? 450;
  return {
    version: raw.version ?? "0.3",
    meta: {
      name: raw.meta?.name ?? "Untitled",
      duration: raw.meta?.duration ?? 2000,
      fps: raw.meta?.fps ?? 60,
      canvas: { width: w, height: h },
      background: raw.meta?.background ?? "#0d0d12",
      description: raw.meta?.description ?? "",
    },
    assets: raw.assets ?? [],
    layers: (raw.layers ?? []).map(normalizeLayer),
    compositions: raw.compositions ?? [],
    camera: raw.camera ?? undefined,
    intent: raw.intent ?? "",
  };
}

function normalizeLayer(l: any): Layer {
  return {
    ...l,
    id: l.id ?? crypto.randomUUID(),
    visible: l.visible ?? true,
    locked: l.locked ?? false,
    blendMode: l.blendMode ?? 'normal',
    transform: {
      x: l.transform?.x ?? 400,
      y: l.transform?.y ?? 225,
      width: l.transform?.width ?? 200,
      height: l.transform?.height ?? 100,
      rotation: l.transform?.rotation ?? 0,
      scale: l.transform?.scale ?? { x: 1, y: 1 },
      anchor: l.transform?.anchor ?? { x: 0.5, y: 0.5 },
    },
    keyframes: l.keyframes ?? [],
  };
}
```

---

## 9. Frontend Component Architecture

### Editor Layout

```tsx
// app/editor/page.tsx — Layout structure
<EditorLayout>
  <Toolbar />            {/* Top: tool selection, zoom, undo/redo, save */}
  <div className="editor-body">
    <LayerPanel />       {/* Left sidebar: layer list, visibility, reorder */}
    <CanvasArea>
      <Canvas />         {/* Center: rAF loop, selection handles, drag */}
      <Timeline />       {/* Bottom: scrubber, keyframe diamonds */}
    </CanvasArea>
    <RightPanel>
      <PromptPanel />    {/* AI prompt input + mode toggle (Generate/Edit) */}
      <PropertiesPanel />{/* Transform / Style / Keyframes tabs */}
      <ExportPanel />    {/* Format selector, quality, download button */}
    </RightPanel>
  </div>
</EditorLayout>
```

### Zustand Store — `scene.ts`

```typescript
interface SceneStore {
  scene: MAFScene;
  history: MAFScene[];        // snapshots for undo (max 50)
  historyIndex: number;
  selectedIds: string[];      // selected layer IDs

  // Actions
  setScene: (scene: MAFScene) => void;
  updateLayer: (id: string, changes: Partial<Layer>) => void;
  addLayer: (layer: Layer) => void;
  deleteLayer: (id: string) => void;
  reorderLayers: (fromIdx: number, toIdx: number) => void;
  setKeyframe: (layerId: string, kf: Keyframe) => void;
  deleteKeyframe: (layerId: string, time: number) => void;
  undo: () => void;
  redo: () => void;
  setSelected: (ids: string[]) => void;
}

// Every mutation that should be undoable:
// 1. Pushes current scene to history array
// 2. Sets the new scene
// History is capped at 50 snapshots to limit memory
```

### Zustand Store — `ui.ts`

```typescript
interface UIStore {
  activeTool: 'select' | 'pan' | 'rect' | 'circle' | 'text';
  zoom: number;                    // 0.1 to 5.0
  panOffset: { x: number; y: number };
  currentTime: number;             // ms, synced with rAF loop
  isPlaying: boolean;
  isPanelOpen: { layers: boolean; properties: boolean; prompt: boolean; export: boolean };
  activeTab: 'transform' | 'style' | 'keyframes';
  isGenerating: boolean;           // AI generation in progress
  exportProgress: number | null;   // 0-1 during video export
}
```

---

## 10. Authentication & Authorization

### Auth Flow

```typescript
// 1. User clicks "Sign in with Google" on /login
// 2. Supabase Auth handles OAuth redirect
// 3. Supabase redirects to /auth/callback with code
// 4. app/(auth)/callback/route.ts exchanges code for session
// 5. Supabase sets secure httpOnly cookie with JWT
// 6. middleware.ts protects /editor and /dashboard routes

// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session && req.nextUrl.pathname.startsWith('/editor')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return res;
}
```

### Rate Limiting (Per-User, Server-Side)

```typescript
// app/api/ai/generate/route.ts
export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  // Check rate limit
  const { data: profile } = await supabase
    .from('profiles')
    .select('ai_gens_today, ai_gen_limit, limits_reset_at')
    .eq('id', user.id)
    .single();

  // Reset if 24h has passed
  const resetAt = new Date(profile.limits_reset_at);
  if (Date.now() - resetAt.getTime() > 86400000) {
    await supabase.from('profiles').update({
      ai_gens_today: 0,
      limits_reset_at: new Date().toISOString()
    }).eq('id', user.id);
    profile.ai_gens_today = 0;
  }

  if (profile.ai_gens_today >= profile.ai_gen_limit) {
    return Response.json({
      error: 'rate_limit',
      remaining: 0,
      reset_at: new Date(resetAt.getTime() + 86400000)
    }, { status: 429 });
  }

  // ... call Claude API ...

  // Increment counter
  await supabase.from('profiles')
    .update({ ai_gens_today: profile.ai_gens_today + 1 })
    .eq('id', user.id);
}
```

---

## 11. Video Export Pipeline

Everything renders **in the browser**. No server upload, no render queue. The ffmpeg.wasm binary (~30 MB) is loaded lazily on first export and cached. Requires Cross-Origin-Isolation headers.

### Export Functions by Format

| Format | Method | Codec / Settings | Notes |
|---|---|---|---|
| MP4 | ffmpeg.wasm | libx264, yuv420p, crf 18, faststart | Best compatibility. No alpha channel. |
| WebM | ffmpeg.wasm | libvpx-vp9, yuva420p | Supports alpha/transparency. Larger file. |
| GIF | ffmpeg.wasm | palettegen+paletteuse, max 24 fps | Capped at 24 fps for file size. Loop count configurable. |
| GSAP | Client codegen | TypeScript string template | Single HTML file. Self-contained. |
| CSS | Client codegen | `@keyframes` template | Single HTML file. No JS dependencies. |
| Framer | Client codegen | TSX template | Import into any React/Next.js project. |
| Lottie | Client codegen | Lottie JSON v5 spec | Compatible with LottieFiles, react-lottie. |

### COOP/COEP Headers (Required for ffmpeg.wasm)

```typescript
// next.config.ts — development
const nextConfig = {
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
      ],
    }];
  },
};
```

```jsonc
// vercel.json — production (required separately)
{
  "headers": [{
    "source": "/(.*)",
    "headers": [
      { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
      { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" }
    ]
  }]
}
```

---

## 12. Edge Cases & How to Resolve Them

### AI Returns Malformed / Truncated JSON

**Problem scenarios:**
- Claude hits `max_tokens` mid-generation and the JSON is truncated (missing closing braces)
- Local model (Ollama) adds prose before/after the JSON despite instructions
- AI generates a valid JSON object but it's missing required fields
- Nested gradient stops are missing `"color"` or `"offset"` keys

**Resolution:**
- `extractJson()`: scan response text for the first `{` and last matching `}` — extract just that substring. This handles prose wrapping.
- Increase `max_tokens` to `4096` for generate, `2048` for edit mode. Monitor `output_tokens` in logs.
- If `JSON.parse` fails after extraction, fire a second Claude call (temperature 0.2) with the broken JSON and ask it to fix it only.
- `normalizeScene()` fills every missing field with a type-safe default. The renderer never crashes on a partial AI response.
- If repair also fails: show user *"Generation failed — try again"* with a retry button. Never show a blank canvas silently.

### ffmpeg.wasm Fails to Load

**Problem scenarios:**
- `SharedArrayBuffer` not available because COOP/COEP headers are missing in production
- The 30 MB WASM binary fails to download (network timeout, CDN issue)
- Safari on iOS does not support `SharedArrayBuffer` at all

**Resolution:**
- Always set COOP/COEP in both `next.config.ts` (dev) and `vercel.json` (prod). Test with a canary deployment before launch.
- Check: `typeof SharedArrayBuffer !== "undefined"` before initiating export. If missing, show an error explaining the browser requirement.
- Lazy-load ffmpeg.wasm with a progress indicator. Retry once on download failure.
- For Safari/iOS: offer a *"Download frames as ZIP"* fallback using JSZip. Inform user the full MP4 export requires Chrome/Firefox.
- Keep the ffmpeg singleton alive after first load — don't reload it on every export.

### Video Export: Blank Frames

**Problem scenarios:**
- Uploaded SVG/PNG assets not yet loaded into the browser's image cache when frame capture starts
- Canvas context state not reset between frames (transforms accumulating)

**Resolution:**
- Call `preloadSceneAssets(scene)` and `await` it before starting the frame capture loop. This creates `Image` objects for every asset URL and waits for `onload`.
- Call `ctx.save()` at the start of each frame and `ctx.restore()` at the end. The pure `render()` function should save/restore internally.
- After each `canvas.toBlob()` call, verify the blob size is > 1 KB. If a frame produces a tiny blob, log it and retry that frame once.

### Rate Limit Hit Mid-Session

**Problem scenarios:**
- User hits their 10 generations/day limit while actively working
- Multiple browser tabs open for the same user, each sending AI requests concurrently

**Resolution:**
- The `/api/ai/generate` endpoint returns `429` with `remaining: 0` and `reset_at` timestamp.
- The `PromptPanel` component checks for `429` and shows a clear message: *"You've used all 10 free generations today. Resets at {time}."* with an upgrade CTA.
- For concurrent tabs: the rate limit is checked and incremented in a single database transaction (atomic update) to prevent race conditions.
- **Do NOT silently fail.** The user must always know why the generation didn't happen.

### Timeline Keyframe UX — Hard to Click

**Problem scenarios:**
- Keyframe diamonds are visually small (8×8 px) but their hit area must be larger for usability
- Overlapping keyframes at the same time position

**Resolution:**
- Render keyframe diamonds as 8×8 px visuals but create a **20×20 px invisible hit area** centered on each diamond.
- Use `pointer-events` SVG regions or absolute-positioned divs for hit areas, not the visual element itself.
- For overlapping keyframes: offset them vertically and show a count badge. Clicking opens a popover listing all keyframes at that time.

### Renderer Performance Drop

**Problem scenarios:**
- Complex scenes with 20+ layers, multiple particle systems, and heavy blur/glow effects dropping below 55 fps
- Text layers with per-character stagger iterating canvas operations for 100+ characters per frame

**Resolution:**
- Profile with Chrome DevTools: the flame chart will identify the exact expensive operation.
- Cache particle arrays by layer ID — only recalculate when the config changes, not every frame.
- For text stagger: pre-calculate character positions at scene load time, not per frame.
- Offer a *"Performance Mode"* toggle that disables blur, glow, and reduces particle count by 50%.
- Warn in the export panel if the scene is likely to render slowly (>15 layers with effects).

### Supabase Free Tier Limits

**Problem scenarios:**
- Free tier: 500 MB database, 1 GB storage, 50,000 monthly active users
- MAF JSON scenes can be 50–200 KB each. 500 MB supports ~5,000–10,000 scenes.
- Supabase pauses free projects after 7 days of inactivity

**Resolution:**
- Compress `maf_json` before storing: `JSON.stringify` + gzip (via `CompressionStream` API). Typical compression: 60–70% size reduction.
- Implement scene archiving: scenes not opened in 90 days move to "archived" status with `maf_json` nulled out (just metadata remains).
- Upgrade to Supabase Pro ($25/mo) when hitting limits. **Do NOT optimize prematurely.**
- For the inactivity pause: set up a weekly health-check ping via a GitHub Actions cron job or Vercel Cron.

### Figma Plugin: Cross-Origin Restrictions

**Problem scenarios:**
- Figma plugin iframe cannot make direct requests to Supabase or the MAF Studio backend
- Large frames with many layers may exceed the 32 MB message size limit between plugin code and UI

**Resolution:**
- The Figma plugin generates MAF JSON entirely client-side (no network calls). It posts the JSON to the parent window via `window.parent.postMessage()`.
- The user then pastes or imports this JSON into the main MAF Studio editor.
- For large frames: chunk the layer list into batches of 50, send multiple messages, and reconstruct in the editor.

### Undo/Redo: Large Scene History

**Problem scenarios:**
- Storing 50 full MAF JSON snapshots in memory (~10 MB per scene × 50 = 500 MB) for complex projects

**Resolution:**
- Cap history at 50 entries and FIFO-drop oldest when limit is hit.
- For scenes >100 KB, store structural diffs (JSON-patch RFC 6902) instead of full snapshots to reduce memory by ~90%.
- Implement `history.clear()` on scene load (no undo into a previous session).

### Claude API Key Exposure

> **Critical:** Never expose the Anthropic API key client-side. It would allow anyone to use your Claude credits.

**Resolution:**
- The API key lives **only** in Vercel environment variables (server-side).
- All Claude calls go through `/api/ai/generate` and `/api/ai/edit` — Next.js API routes running on Vercel's servers.
- The client sends its Supabase JWT; the server validates it before making any Claude API call.
- Use `ANTHROPIC_API_KEY` (**never** `NEXT_PUBLIC_ANTHROPIC_API_KEY` — the `NEXT_PUBLIC_` prefix exposes it to the browser).

---

## 13. Environment Variables & Configuration

```bash
# .env.local (local development — never commit to git)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...   # Safe to expose (RLS enforces security)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...        # SECRET — never NEXT_PUBLIC_

# Anthropic (SERVER-SIDE ONLY — never prefix with NEXT_PUBLIC_)
ANTHROPIC_API_KEY=sk-ant-api...

# Optional: Ollama (for local dev without API costs)
NEXT_PUBLIC_OLLAMA_URL=http://localhost:11434  # Fine to expose (local only)

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Vercel Production Environment Variables

Set in **Vercel Dashboard → Project → Settings → Environment Variables**.  
Mark `ANTHROPIC_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` as **"Server"** only.

| Variable | Environment |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Preview + Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Preview + Production |
| `SUPABASE_SERVICE_ROLE_KEY` | Production only (Server) |
| `ANTHROPIC_API_KEY` | Production only (Server) |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.com` |

---

## 14. Deployment — Zero-Cost Infrastructure

| Service | Purpose | Free Tier | When to Upgrade |
|---|---|---|---|
| **Vercel** | Frontend + API Routes hosting | Unlimited deployments, 100 GB bandwidth, 10 s function timeout | When >100 GB/mo bandwidth or >10 s AI timeout (Pro: $20/mo) |
| **Supabase** | PostgreSQL + Auth + Storage | 500 MB DB, 1 GB Storage, 50 K MAU | When >50 K MAU or >500 MB DB (Pro: $25/mo) |
| **Anthropic** | Claude API for AI generation | $5 free trial credits | Pay per token after trial (~$0.003/generation) |
| **GitHub** | Source control + CI/CD | Unlimited private repos | Never (free forever for this use case) |
| **Vercel Analytics** | Web analytics | Free for 1 site | Never for early stage |

### Deployment Checklist

```bash
# Step 1: Supabase setup
- Create project at supabase.com (free)
- Run all SQL migrations (Section 5) in the SQL editor
- Enable Google OAuth in Authentication → Providers
- Add your domain to Authentication → URL Configuration
- Create a "thumbnails" bucket in Storage (public: false)

# Step 2: Vercel setup
- Import GitHub repo at vercel.com
- Set all environment variables (Section 13)
- Ensure COOP/COEP headers are in vercel.json (Section 11)
- Deploy: git push origin main → auto-deploys

# Step 3: Verify critical functionality
☐ Visit /login — Google OAuth works
☐ Visit /editor — loads default preset, canvas animates
☐ Type prompt — AI generates a scene in 3-6s
☐ Click Export → MP4 — video downloads successfully
☐ Export GSAP — paste into CodePen, animation works
☐ Save scene — appears on /dashboard
☐ Undo (Ctrl+Z) — previous scene state restored
```

---

## 15. Testing Strategy

### Unit Tests (Vitest)

```typescript
// Test: renderer produces correct output for known scene
describe('renderer/engine', () => {
  it('interpolates opacity correctly between keyframes', () => {
    const scene = createTestScene([
      { time: 0, properties: { opacity: 0 }, easing: 'linear' },
      { time: 1000, properties: { opacity: 1 }, easing: 'linear' },
    ]);
    const props = getPropertiesAtTime(scene.layers[0], 500);
    expect(props.opacity).toBeCloseTo(0.5, 2);
  });
});

// Test: normalizeScene fills missing fields
describe('ai/normalize', () => {
  it('fills missing transform fields with defaults', () => {
    const raw = { version: '0.3', meta: { duration: 2000 }, layers: [{ type: 'rect' }] };
    const scene = normalizeScene(raw);
    expect(scene.layers[0].transform.x).toBe(400);
    expect(scene.layers[0].visible).toBe(true);
  });
});

// Test: extractJson handles prose wrapping
describe('ai/generate', () => {
  it('extracts JSON from prose-wrapped response', () => {
    const raw = 'Here is your animation: {"version":"0.3",...} Hope that helps!';
    expect(extractJson(raw)).toMatch(/^{/);
  });
});
```

### E2E Tests (Playwright)

```typescript
// test/e2e/editor.spec.ts
test('full generation → export flow', async ({ page }) => {
  await page.goto('/editor');

  // Type prompt
  await page.fill('[data-testid="prompt-input"]', 'A bouncing purple circle');
  await page.click('[data-testid="generate-button"]');

  // Wait for generation (up to 15s)
  await page.waitForSelector('[data-testid="canvas-ready"]', { timeout: 15000 });

  // Verify a layer was created
  expect(await page.locator('[data-testid="layer-item"]').count()).toBeGreaterThan(0);

  // Export to GIF (fastest format for testing)
  await page.click('[data-testid="export-format-gif"]');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('[data-testid="export-button"]'),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.gif$/);
});
```

---

## 16. Production Launch Checklist

### Critical — Must Complete Before Launch

- [ ] Claude Sonnet as default AI backend (not Ollama) for all public users
- [ ] API key proxied through Next.js API routes — never exposed client-side
- [ ] Supabase RLS enabled on all tables (`profiles`, `scenes`, `assets`, `ai_generations`, `exports`)
- [ ] Rate limiting: 10 AI generations/day and 5 exports/day on free tier
- [ ] Auth: Google OAuth + magic link working end-to-end including email confirmation
- [ ] COOP/COEP headers configured in `vercel.json` (required for ffmpeg.wasm)
- [ ] 30+ quality presets shipped — the default experience must be beautiful
- [ ] `normalizeScene()` handling all possible malformed AI responses without crashing
- [ ] Error states: every failure shows a clear message + retry, never a blank canvas
- [ ] Scene save/load working: create, update, list, delete via API

### Important — Ship Within Launch Week

- [ ] Scoped AI edits: select a layer, prompt just that layer
- [ ] All code exports tested in real projects (GSAP → CodePen, Framer → Next.js, Lottie → LottieFiles)
- [ ] Performance audit: all presets maintain ≥55 fps on a mid-range laptop
- [ ] Mobile: editor stays desktop-only, but `/dashboard` and exported previews work on mobile
- [ ] Figma plugin published to Figma Community
- [ ] Keyboard shortcuts: `Ctrl+Z` undo, `Ctrl+Y` redo, `Space` play/pause, `Delete` remove layer
- [ ] Upload assets: SVG and PNG drag-and-drop working and embedded in scene JSON

### Post-Launch (Month 1)

- [ ] Scene thumbnail generation: capture first frame as PNG, upload to Supabase Storage
- [ ] Community gallery: public scenes browseable at `/gallery`
- [ ] Custom easing curve editor: drag Bezier handles on timeline
- [ ] Publish MAF spec as an open standard on GitHub
- [ ] Upgrade Supabase to Pro when hitting 40 K MAU

---

## 17. Roadmap & Future Features

| Version | Timeline | Scope |
|---|---|---|
| **v1.0 — Public launch** | Weeks 1–6 | Auth + Supabase, Claude API backend, 30+ presets, rate limiting, scene save/load, scoped AI edits, all code exports validated, COOP/COEP in production. |
| **v2.0 — Community & brand kit** | Month 2–3 | Template marketplace with user-submitted scenes, brand kit (save brand colors/fonts/logo across generations), audio sync (beat detection → keyframe generation), custom easing curve editor, masking UI panel. |
| **v3.0 — Open standard** | Month 4–6 | Publish MAF spec as an open standard on GitHub. MAF runtime npm package for React and React Native. Server-side render worker for 4K export. Collaborative editing via CRDTs (Yjs). Nested compositions (pre-comps). |
| **v4.0 — AE replacement** | Month 6+ | Expression system (wiggle, loopOut, property linking). Physics simulation (spring chains, gravity, collision). After Effects import via ExtendScript. SVG path morphing. 3D layer support via WebGL renderer. |

---

*MAF Studio — Complete PRD & Technical Reference · v1.0 · For Engineering & Product*