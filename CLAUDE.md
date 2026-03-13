# Symbaroum Stories — Campaign Chronicle Website

Static GitHub Pages site showcasing illustrated moments from a long-running Symbaroum tabletop RPG campaign.

**Live site:** https://voidnologo.github.io/symbaroum-stories/
**Source project** (transcripts, narrative, artwork jobs): `/home/void/projects/transcribe/`

## Site Architecture

Pure static HTML/CSS/JS — no build tools. GitHub Pages compatible.

| File | Purpose |
|---|---|
| `index.html` | Landing page — hero crossfade + campaign intro + gallery |
| `scene.html` | Scene detail page — shell populated by JS via `?id=` param |
| `css/style.css` | All styles — Japanese ink-wash dark aesthetic |
| `js/main.js` | Gallery rendering, scene rendering, hero crossfade, modal lightbox |
| `data/scenes.json` | **Single source of truth** for all scene data |
| `images/` | Original PNGs (thumbnails, hero originals) |
| `images-4x/` | 4x upscaled WebP (scene hero images + modal + hero bg) |

## scenes.json Schema

```json
{
  "id": "characterSlug-scene-slug",
  "title": "Short Evocative Title",
  "character": "Full Character Name",
  "characterSlug": "agathara|karano|reginald|aro|chikubi|coriol|igni|lamerra",
  "description": "One paragraph, present tense.",
  "images": ["scene-slug_v01_00001_.png"],
  "source": "YYYY-MM-DD",
  "searchHint": "keywords for finding in transcripts",
  "narrativeSource": "Book Two, Chapter N — Title",
  "narrative": ["Paragraph one.", "Paragraph two.", "..."]
}
```

- `images[]` holds **original PNG filenames** — JS resolves to `images/` for thumbnails, `images-4x/{stem}.webp` for HD
- Gallery and scene pages are **fully dynamic** — adding to scenes.json is all that's needed
- Write scenes.json with Python `json.dump()` — never shell redirect (`>`) due to zsh noclobber

## Design System

- **Palette:** `--bg #0c0a08` / `--gold #c9a84c` / `--gold-dim #7a6330` / `--ink #e8e0d0`
- **Fonts:** Cinzel (headings) + EB Garamond (body) via Google Fonts
- **Aesthetic:** Japanese ink-wash meets dark European fantasy

## Available Skills

### `/illustrate-scene`
**Full pipeline for adding new illustrated scenes to this site.**

```
/illustrate-scene Add three scenes for Agathara: compassion, action, political.
/illustrate-scene Illustrate 4 random scenes across all main heroes.
/illustrate-scene Illustrate the scene in Book Two Chapter 9 where Reginald deciphers the cipher.
```

Phases: scene research → art prompt → ComfyUI generation → image selection → narrative extraction → upscale → scenes.json → commit → push.

Skill file: `.claude/commands/illustrate-scene.md` (symlink → `transcribe/.claude/commands/`)
Scripts: `.claude/scripts/` (symlink → `transcribe/.claude/scripts/`)

## AI Art Style

All artwork uses Flux1-dev + three LoRAs:
- `nistyle_manga_sketch_flux.safetensors` (strength 0.75)
- `dark_chiaroscuro_lighting_flux.safetensors` (strength 0.45)
- `fantasy_impressions_flux.safetensors` (strength 0.50)

Prompt formula: Japanese ink-wash opening + detailed scene description + standard closing paragraph.
See `artwork/jobs/scenes.json` in the transcribe project for reference prompts.

## Deployment

```bash
git add .
git commit -m "message"
git push   # → GitHub Pages, live in ~2 minutes
```

Review locally before pushing:
```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```
