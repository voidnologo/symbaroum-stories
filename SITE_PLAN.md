# Build Prompt: Symbaroum Story Showcase Website

Build a static GitHub Pages website for a Symbaroum tabletop RPG campaign story showcase.

## Project Context

Symbaroum is a Swedish dark fantasy tabletop RPG set in the world of Ambria and the vast, corruption-haunted forest of Davokar. This site showcases a long-running campaign through original AI-generated artwork (Japanese ink-wash style, dark fantasy aesthetic) paired with narrative context from actual play.

All artwork is in `images/` — 16 PNG files named `scene-[character]-[moment]_v[N]_[seed].png`. Scene metadata (titles, descriptions, character attribution) is in `data/scenes.json`.

## Site Structure

**Three page types — all pure HTML/CSS/JS, no build tools, GitHub Pages compatible:**

1. `index.html` — Main landing page
2. `scene.html` — Scene detail template (reads `?id=[scene-id]` URL param, renders data from scenes.json)
3. `css/style.css` — All styles
4. `js/main.js` — Shared JS (scene loader, nav, any animations)
5. `data/scenes.json` — Already exists; load with fetch()

## index.html Content & Layout

**Hero section:**
- Full-viewport opening with campaign title: **"The Gathering Dark"** — *A Symbaroum Campaign Chronicle*
- Tagline: *"Into the forest. Into the dark. Into what we become."*
- Subtle animated texture — not particles, something more organic: perhaps a very slow drift of ink-wash texture overlay, or a vignette that pulses slightly
- A single "Enter" or scroll-down affordance

**Campaign introduction (below hero):**
- ~300 words introducing Symbaroum and the campaign. Write this with atmosphere — the world, the forest, the corruption mechanic, the characters. Use the character names: **Agathara Silvershade** (Jessica), **Karano** (Derek), **Reginald** (Felipe), **Aro Sunspear** (divine companion). This is a real campaign; tone should be reverent and cinematic, not gamey.
- Layout: centered readable column, ~65ch max-width, generous line-height

**Scene gallery:**
- Section heading: "Moments from the Chronicle"
- Responsive thumbnail grid: 3 columns desktop, 2 tablet, 1 mobile
- Each card: image thumbnail (aspect-ratio: 16/11 crop from 1024×704 original), scene title below, character name in smaller text, subtle hover lift + glow effect
- Cards link to `scene.html?id=[scene-id]`
- Character-grouped: Agathara scenes first, then Aro, then Karano, then Reginald — with a subtle divider or label between groups

## scene.html Content & Layout

- Reads `?id` param, fetches `data/scenes.json`, finds matching scene object
- **Artwork display**: full viewport-width image at top, no padding, edge-to-edge. If a scene has 2 image variants, display both side-by-side (with a thin gap) or stacked on mobile.
- **Scene title** and **character name** overlaid on the bottom of the image (text over dark gradient)
- **Narrative section** below the image: centered column, serif body text, generous spacing. The `description` field from scenes.json is the narrative text — display it as a styled pull-quote / dramatic prose block, not a dry caption. Add a subtle decorative element (rule, ink-mark SVG, or border) between the image and text.
- **Back to chronicle** link — top-left corner, minimal, breadcrumb style
- 404-style fallback if scene ID not found

## Visual Design System

**The aesthetic must feel like the artwork itself: Japanese ink-wash meets dark European fantasy. Think museum-quality, not game-promo.**

**Color palette:**
```
--bg:          #0c0a08   /* near-black with warm undertone — like aged paper in darkness */
--bg-surface:  #131109   /* card backgrounds, slightly lighter */
--bg-elevated: #1a1712   /* hover states */
--gold:        #c9a84c   /* muted antique gold — Prios divine light */
--gold-dim:    #7a6330   /* subtle gold, borders, dividers */
--ink:         #e8e0d0   /* warm off-white for body text — not pure white */
--ink-dim:     #8a7f6e   /* secondary text, labels */
--accent:      #3d2b1f   /* dark rust — used sparingly for structure */
```

**Typography:**
- Headings: `Cinzel` or `Cormorant Garamond` (Google Fonts) — classical serif with weight. Campaign title in Cinzel at large scale.
- Body: `EB Garamond` or `Crimson Pro` — readable old-style serif at 18–20px, generous leading (1.75)
- Labels/nav: `Cinzel` small-caps or spaced uppercase
- Load from Google Fonts: `Cinzel:wght@400;700`, `EB+Garamond:ital,wght@0,400;0,600;1,400`

**Card design:**
- Near-black background (`--bg-surface`)
- Very thin border: `1px solid var(--gold-dim)` — like a frame
- On hover: border brightens to `--gold`, box-shadow `0 0 20px rgba(201,168,76,0.15)`, slight translate-up (-3px)
- Image fills top of card; title and character name below in styled typography
- Transition: all 0.3s ease

**Scene detail page:**
- Image is the hero — full-bleed, no borders, dark page behind it
- Text section: `--bg` background, `--ink` text, centered column with `max-width: 720px`
- The narrative description gets a drop-cap first letter (CSS `::first-letter`) or large initial
- A thin horizontal rule (`border: 1px solid var(--gold-dim)`) between image and text, full-width, with a small SVG ink-drop or sun symbol centered on it

**Page transitions:** CSS fade-in on page load (`@keyframes fadeIn`, `animation: fadeIn 0.6s ease`). No heavy JS libraries.

**Texture:** A very subtle paper/grain texture overlay on the `body` — use a CSS-only noise approach (`filter: url(#noise)` SVG filter inline, or a base64 PNG data URI for the grain texture at low opacity: `opacity: 0.03–0.05`). Avoid making it look like a grunge site; this is museum-quality dark.

## Technical Requirements
- Pure HTML/CSS/JS — no frameworks, no bundlers
- `fetch('data/scenes.json')` to load scene data on scene.html
- `URLSearchParams` to read the `?id=` parameter
- GitHub Pages compatible (no server-side rendering needed)
- Must work when opened locally via file:// for development (use relative paths everywhere; note that `fetch()` may need a local server — document this in a comment)
- All images referenced by filename only (e.g. `images/scene-agathara-crown-ship_v01_678056744595008.png`)
- Add `<meta>` tags: description, og:title, og:image for each scene page

## Navigation
- Minimal top nav: site title (left) + "← Chronicle" link (right, on scene pages only)
- No hamburger menu — keep it simple
- Nav background: `rgba(12,10,8,0.92)` with `backdrop-filter: blur(8px)` — frosted dark glass

## Content to Write (generate this, do not use placeholders)

**Campaign introduction (~300 words):** Write this in the voice of a chronicle — atmospheric, literary, not a game advertisement. Cover: the world of Symbaroum (Ambria, Davokar, corruption), the campaign arc (The Gathering Dark), the four characters (Agathara the Confessor who burns with holy light and pays for it in corruption, Karano the Ironsworn hunter who walks clean through storms that would destroy others, Reginald the scholar-rogue whose curiosity opened a door in his mind he cannot close, and Aro Sunspear the patron saint who fights on after death as a flickering golden presence). End with something that makes visitors want to click into the scenes.

**Scene description display:** The `description` field in scenes.json is the narrative text. Display it with typographic care — the opening sentence deserves emphasis.

## File Deliverables
1. `index.html` — landing page
2. `scene.html` — scene detail template
3. `css/style.css` — complete stylesheet
4. `js/main.js` — scene loader + nav behavior

The `data/scenes.json` and `images/` folder already exist — do not recreate them.

## Local Development
To test locally (required for fetch() to work):
```bash
python3 -m http.server 8000
# then visit: http://localhost:8000
# scene routing: http://localhost:8000/scene.html?id=agathara-crown-ship
```
