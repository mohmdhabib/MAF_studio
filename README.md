# MAF Studio v0.3

**The AI-native motion graphics editor for everyone — describe an animation, get a video.**

> Natural Language → MAF JSON (IR) → GPU Renderer → Video (MP4/WebM/GIF) or Code (GSAP/CSS/Framer/Lottie)

---

## What is MAF Studio?

MAF Studio lets anyone — creators, marketers, social media managers, developers — describe a motion graphic in plain English and get back a polished animation. Under the hood, the AI never touches pixels: it reads and writes the **Motion Animation Format (MAF)**, a structured JSON scene graph. That structure is what makes the AI reliable, the result fully editable, and the same animation exportable to:

- **Video** — MP4 (sharing/social), WebM with alpha (overlays), GIF (loops)
- **Code** — GSAP, CSS, Framer Motion, Lottie (for developers who want it in their product)

All rendered locally in your browser — nothing uploaded to a server.

---

## Quick Start

```bash
git clone <repo>
cd maf-studio
npm install
cp .env.example .env
# Add your Anthropic API key to .env
npm run dev
```

Open `http://localhost:3000`

> Note: video export uses ffmpeg.wasm, which requires Cross-Origin-Isolation headers. These are already configured in `vite.config.ts` for both dev and preview.

---

## The Pipeline

```
User types: "A purple logo bounces in with a glow"
        ↓
Claude API reads MAF schema → outputs MAF JSON
        ↓
MAF JSON stored in Zustand (single source of truth)
        ↓
Canvas renderer reads JSON → draws 60fps preview
        ↓
User tweaks keyframes manually (timeline, properties panel)
        ↓
Export:
  🎬 Video → captureFrames() → ffmpeg.wasm → MP4 / WebM / GIF
  </> Code → GSAP / CSS / Framer Motion / Lottie
```

---

## MAF Schema v0.2

```json
{
  "version": "0.2",
  "meta": {
    "name": "My Animation",
    "duration": 2000,
    "fps": 60,
    "canvas": { "width": 800, "height": 450 },
    "background": "#0d0d12",
    "description": "..."
  },
  "assets": [],
  "layers": [
    {
      "id": "layer_001",
      "name": "Logo",
      "type": "rect",
      "visible": true,
      "locked": false,
      "blendMode": "normal",
      "transform": {
        "position": { "x": 400, "y": 225 },
        "scale": { "x": 1, "y": 1 },
        "rotation": 0,
        "opacity": 1,
        "anchor": { "x": 0, "y": 0 }
      },
      "keyframes": [
        {
          "time": 0,
          "properties": { "opacity": 0, "scale": { "x": 0.8, "y": 0.8 } },
          "easing": "easeOutBack"
        },
        {
          "time": 600,
          "properties": { "opacity": 1, "scale": { "x": 1, "y": 1 } },
          "easing": "easeOutBack"
        }
      ],
      "style": { "width": 200, "height": 80, "fill": "#6c63ff", "borderRadius": 12 }
    }
  ],
  "compositions": [],
  "intent": "Logo bounces in with spring energy"
}
```

**Layer types:** `rect` · `circle` · `text` · `svg` · `group` · `path`

**Easings:** `linear` · `easeOutQuad` · `easeOutCubic` · `easeOutBack` · `easeOutBounce` · `spring` · `easeOutElastic` · `easeInElastic`

---

## Export Formats

### Video (primary, consumer-facing)

| Format | Use case |
|---|---|
| **MP4** | Sharing, social media, presentations |
| **WebM (Alpha)** | Transparent background — overlays, lower-thirds |
| **GIF** | Looping animation for chat, docs, README |

You can export at 1x or 2x resolution. Everything renders locally via ffmpeg.wasm — no server upload, no rendering queue.

### Code (secondary, developer-facing)

| Format | Use case | Output |
|---|---|---|
| **GSAP** | Web animations, landing pages | Self-contained HTML |
| **CSS** | Pure web, no dependencies | HTML + @keyframes |
| **Framer Motion** | React apps | .tsx component |
| **Lottie** | Mobile apps, LottieFiles | .json |



---

## Figma Plugin

1. Open Figma Desktop
2. Plugins → Development → Import plugin from manifest
3. Point to `figma-plugin/manifest.json`
4. Select layers → click "Import to MAF Studio"
5. Paste the JSON into MAF Studio's JSON panel → Apply

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `V` | Select tool |
| `R` | Rectangle tool |
| `C` | Circle tool |
| `T` | Text tool |
| `G` | Toggle grid |
| `K` | Add keyframe |
| `Delete` | Delete selected layer |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+D` | Duplicate layer |
| `Ctrl+E` | Open export modal |
| `Escape` | Deselect |

---

## Roadmap

### v0.4
- [ ] Scoped AI edits — select a layer on canvas, prompt just that layer
- [ ] Custom easing curve editor (bezier handles)
- [ ] Audio sync (beat detection → keyframe generation)
- [ ] SVG/image asset upload
- [ ] More layer types: gradients, paths, masks
- [ ] Larger preset/template library (20+)

### v1.0
- [ ] MAF spec published as open standard
- [ ] Community template marketplace
- [ ] Physics simulation (gravity, spring chains)
- [ ] Collaborative editing
- [ ] Brand kits (colors, fonts, logo persistence across generations)

---

## Why MAF?

Most AI animation tools are either black-box video generators (uneditable) or require manual keyframing (steep learning curve). MAF Studio's structured IR means the AI generates reliable, editable scenes — and because video and code export both read from the same MAF JSON, one generation serves creators (MP4/GIF) and developers (GSAP/Lottie) alike.

**MAF is to animation what JSON is to data.** Open, readable, editable by both humans and AI.

---

Built with React + TypeScript + Canvas API + ffmpeg.wasm + Claude API
"# MAF_studio" 
