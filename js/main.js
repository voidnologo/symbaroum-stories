/**
 * THE GATHERING DARK — Symbaroum Campaign Chronicle
 * main.js — Scene loader, nav behavior, shared utilities
 *
 * NOTE: fetch() requires a local server to work correctly.
 * Run: python3 -m http.server 8000
 * Then visit: http://localhost:8000
 */

'use strict';

/* ============================================================
   UTILITY
   ============================================================ */

/**
 * Fetch scenes.json from the data directory.
 * Resolves relative to the site root regardless of current page depth.
 */
async function fetchScenes() {
  // Determine base path: works for both root and any subdirectory
  const base = findBasePath();
  const response = await fetch(base + 'data/scenes.json');
  if (!response.ok) {
    throw new Error(`Failed to load scenes.json: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Resolve base path from current page location.
 * Both index.html (root) and scene.html (root) are at the same level,
 * so 'data/scenes.json' is always a correct relative path.
 */
function findBasePath() {
  // Both pages are at site root — relative path is always correct.
  return '';
}

/**
 * Resolve image path from filename.
 * @param {string} filename  — base filename from scenes.json (always .png)
 * @param {boolean} hd       — if true, return the 4x WebP from images-4x/
 */
function imgPath(filename, hd = false) {
  if (hd) {
    return 'images-4x/' + filename.replace(/\.png$/, '.webp');
  }
  return 'images/' + filename;
}

/**
 * Escape HTML to prevent XSS (used for any data rendered into innerHTML).
 */
function escapeHtml(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

/* ============================================================
   SCENE DETAIL PAGE — scene.html
   ============================================================ */

/**
 * Initialize the scene detail page.
 * Reads ?id= from URL, fetches scenes.json, renders scene.
 */
async function initScenePage() {
  const params = new URLSearchParams(window.location.search);
  const sceneId = params.get('id');

  const container = document.getElementById('scene-container');
  if (!container) return;

  // Show loading state
  container.innerHTML = '<div class="loading-state">Loading scene&hellip;</div>';

  if (!sceneId) {
    renderNotFound(container, 'No scene ID provided in the URL.');
    return;
  }

  let scenes;
  try {
    scenes = await fetchScenes();
  } catch (err) {
    console.error('Failed to load scenes:', err);
    renderError(container, err.message);
    return;
  }

  const scene = scenes.find(s => s.id === sceneId);

  if (!scene) {
    renderNotFound(container, `No scene found for ID: "${escapeHtml(sceneId)}"`);
    return;
  }

  renderScene(container, scene);
  updatePageMeta(scene);
}

/**
 * Render a found scene into the container element.
 */
function renderScene(container, scene) {
  const images = scene.images || [];
  const isDual = images.length >= 2;

  // Build image markup — use HD WebP for scene hero, with click-to-modal
  const makeImg = (filename, altSuffix) => `
    <img
      src="${escapeHtml(imgPath(filename, true))}"
      alt="${escapeHtml(scene.title)}${altSuffix ? ' — ' + altSuffix : ''}"
      loading="eager"
      class="scene-zoomable"
      data-hd-src="${escapeHtml(imgPath(filename, true))}"
      title="Click to view full size"
      onerror="this.style.display='none'"
    />`;

  let imageHtml;
  if (isDual) {
    imageHtml = `
      <div class="scene-hero-dual">
        ${makeImg(images[0], 'variant 1')}
        ${makeImg(images[1], 'variant 2')}
      </div>`;
  } else {
    imageHtml = `
      <div class="scene-hero-single">
        ${makeImg(images[0] || '', '')}
      </div>`;
  }

  // Divider glyph: Prios sun symbol
  const sunGlyph = `
    <svg class="divider-sun" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="14" cy="14" r="5" stroke="#c9a84c" stroke-width="1.2"/>
      <line x1="14" y1="2" x2="14" y2="6" stroke="#c9a84c" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="14" y1="22" x2="14" y2="26" stroke="#c9a84c" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="2" y1="14" x2="6" y2="14" stroke="#c9a84c" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="22" y1="14" x2="26" y2="14" stroke="#c9a84c" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="5.76" y1="5.76" x2="8.59" y2="8.59" stroke="#c9a84c" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="19.41" y1="19.41" x2="22.24" y2="22.24" stroke="#c9a84c" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="22.24" y1="5.76" x2="19.41" y2="8.59" stroke="#c9a84c" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="8.59" y1="19.41" x2="5.76" y2="22.24" stroke="#c9a84c" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`;

  // Build narrative excerpt markup
  let excerptHtml = '';
  if (scene.narrative && scene.narrative.length > 0) {
    const paragraphs = scene.narrative.map((p, i) =>
      `<p class="scene-excerpt-para${i === 0 ? ' scene-excerpt-first' : ''}">${escapeHtml(p)}</p>`
    ).join('\n');
    const source = scene.narrativeSource
      ? `<div class="scene-excerpt-source">${escapeHtml(scene.narrativeSource)}</div>`
      : '';
    excerptHtml = `
      <div class="scene-excerpt-divider"></div>
      <div class="scene-excerpt">
        ${source}
        <div class="scene-excerpt-body">
          ${paragraphs}
        </div>
      </div>`;
  }

  container.innerHTML = `
    <div class="scene-hero page-fade">
      ${imageHtml}
      <div class="scene-hero-overlay">
        <span class="scene-hero-character">${escapeHtml(scene.character)}</span>
        <h1 class="scene-hero-title">${escapeHtml(scene.title)}</h1>
      </div>
    </div>

    <div class="scene-divider">
      <div class="scene-divider-glyph">${sunGlyph}</div>
    </div>

    <div class="scene-narrative">
      <div class="scene-narrative-inner">
        <p class="scene-description">${escapeHtml(scene.description || '')}</p>
      </div>
    </div>
    ${excerptHtml}
  `;

  // Wire up zoom modal on rendered images
  initImageModal(container);
}

/* ============================================================
   IMAGE MODAL (LIGHTBOX)
   ============================================================ */

/**
 * Wire click-to-zoom on all .scene-zoomable images inside a container.
 * Creates a single shared modal element appended to body if not already present.
 */
function initImageModal(container) {
  // Build or retrieve modal
  let modal = document.getElementById('image-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'image-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Full size image');
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <button class="modal-close" aria-label="Close">&times;</button>
      <div class="modal-img-wrap">
        <img class="modal-img" src="" alt="" />
      </div>`;
    document.body.appendChild(modal);

    // Close on backdrop click or close button
    modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
    modal.querySelector('.modal-close').addEventListener('click', closeModal);

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });

    // Prevent scroll propagation inside modal image wrap
    modal.querySelector('.modal-img-wrap').addEventListener('click', e => {
      // Click on image itself (not backdrop) — do nothing (allow closing via backdrop)
      e.stopPropagation();
    });
  }

  // Attach click handlers to all zoomable images in this container
  container.querySelectorAll('.scene-zoomable').forEach(img => {
    img.addEventListener('click', () => {
      const src = img.dataset.hdSrc || img.src;
      const alt = img.alt;
      openModal(src, alt);
    });
  });
}

function openModal(src, alt) {
  const modal = document.getElementById('image-modal');
  if (!modal) return;
  const modalImg = modal.querySelector('.modal-img');
  modalImg.src = '';       // reset to trigger loading indicator
  modalImg.alt = alt;
  modal.classList.add('is-open');
  document.body.classList.add('modal-open');
  // Load image (may already be cached)
  modalImg.src = src;
}

function closeModal() {
  const modal = document.getElementById('image-modal');
  if (!modal) return;
  modal.classList.remove('is-open');
  document.body.classList.remove('modal-open');
  // Brief delay before clearing src so fade-out looks clean
  setTimeout(() => {
    const modalImg = modal.querySelector('.modal-img');
    if (modalImg) modalImg.src = '';
  }, 300);
}

/**
 * Update page <title> and <meta> tags for the current scene.
 */
function updatePageMeta(scene) {
  document.title = `${scene.title} — The Gathering Dark`;

  const setMeta = (name, content, prop = false) => {
    const attr = prop ? 'property' : 'name';
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('description', scene.description ? scene.description.slice(0, 155) : scene.title);
  setMeta('og:title', `${scene.title} — The Gathering Dark`, true);
  setMeta('og:description', scene.description ? scene.description.slice(0, 155) : scene.title, true);

  if (scene.images && scene.images.length > 0) {
    setMeta('og:image', imgPath(scene.images[0]), true);
  }
}

/**
 * Render a 404-style not-found message.
 */
function renderNotFound(container, detail) {
  container.innerHTML = `
    <div class="not-found page-fade">
      <div class="not-found-code">404</div>
      <h2>Scene Not Found</h2>
      <p>${escapeHtml(detail)}</p>
      <a href="index.html" class="btn-ghost">Return to Chronicle</a>
    </div>`;
}

/**
 * Render a generic fetch error message.
 */
function renderError(container, detail) {
  container.innerHTML = `
    <div class="not-found page-fade">
      <div class="not-found-code">!</div>
      <h2>Could Not Load Scene</h2>
      <p>${escapeHtml(detail)}</p>
      <p style="font-size:0.85rem; color: var(--ink-dim); margin-top:0.5rem;">
        If testing locally, run: <code>python3 -m http.server 8000</code>
      </p>
      <a href="index.html" class="btn-ghost">Return to Chronicle</a>
    </div>`;
}

/* ============================================================
   INDEX PAGE — scene gallery builder
   ============================================================ */

/**
 * Initialize the scene gallery on index.html.
 * Groups scenes by character, renders cards in order.
 */
async function initGallery() {
  const galleryEl = document.getElementById('gallery-root');
  if (!galleryEl) return;

  let scenes;
  try {
    scenes = await fetchScenes();
  } catch (err) {
    console.error('Failed to load scenes:', err);
    galleryEl.innerHTML = `
      <p style="color:var(--ink-dim); text-align:center; padding:2rem;">
        Could not load the scene gallery.
        If you are developing locally, serve with:
        <code>python3 -m http.server 8000</code>
      </p>`;
    return;
  }

  // Character display order and labels
  const characterOrder = [
    { slug: 'agathara', label: 'Agathara Silvershade' },
    { slug: 'aro',      label: 'Aro Sunspear' },
    { slug: 'karano',   label: 'Karano' },
    { slug: 'reginald', label: 'Reginald' },
  ];

  // Group scenes by characterSlug
  const grouped = {};
  for (const scene of scenes) {
    const slug = scene.characterSlug || 'other';
    if (!grouped[slug]) grouped[slug] = [];
    grouped[slug].push(scene);
  }

  // Build HTML for each character group
  let html = '';
  for (const { slug, label } of characterOrder) {
    const group = grouped[slug];
    if (!group || group.length === 0) continue;

    const cards = group.map(scene => buildSceneCard(scene)).join('');

    html += `
      <div class="character-group">
        <div class="group-label">
          <span class="group-label-name">${escapeHtml(label)}</span>
          <span class="group-label-line"></span>
        </div>
        <div class="scene-grid">
          ${cards}
        </div>
      </div>`;
  }

  // Any scenes from unrecognised slugs
  const knownSlugs = new Set(characterOrder.map(c => c.slug));
  const othersGroup = [];
  for (const [slug, group] of Object.entries(grouped)) {
    if (!knownSlugs.has(slug)) othersGroup.push(...group);
  }
  if (othersGroup.length > 0) {
    const cards = othersGroup.map(scene => buildSceneCard(scene)).join('');
    html += `
      <div class="character-group">
        <div class="group-label">
          <span class="group-label-name">Other Scenes</span>
          <span class="group-label-line"></span>
        </div>
        <div class="scene-grid">${cards}</div>
      </div>`;
  }

  galleryEl.innerHTML = html;

  // Stagger-fade cards in as page has loaded
  requestAnimationFrame(() => {
    galleryEl.querySelectorAll('.scene-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(10px)';
      card.style.transition = `opacity 0.5s ease ${i * 0.04}s, transform 0.5s ease ${i * 0.04}s, border-color 0.3s ease, box-shadow 0.3s ease`;
      requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    });
  });
}

/**
 * Build HTML string for a single scene card.
 */
function buildSceneCard(scene) {
  const thumb = scene.images && scene.images[0]
    ? imgPath(scene.images[0])
    : '';

  const multiVariant = scene.images && scene.images.length > 1
    ? `<span class="scene-card-variants" aria-label="${scene.images.length} variants" style="
        position:absolute;
        top:0.5rem;
        right:0.6rem;
        font-family:var(--font-heading);
        font-size:0.58rem;
        letter-spacing:0.15em;
        color:var(--gold-dim);
        background:rgba(12,10,8,0.75);
        padding:0.2em 0.5em;
        pointer-events:none;
      ">${scene.images.length} VARIANTS</span>`
    : '';

  return `
    <a class="scene-card" href="scene.html?id=${encodeURIComponent(scene.id)}">
      <div style="position:relative; line-height:0;">
        <img
          class="scene-card-thumb"
          src="${escapeHtml(thumb)}"
          alt="${escapeHtml(scene.title)}"
          loading="lazy"
          onerror="this.parentElement.parentElement.style.display='none'"
        />
        ${multiVariant}
      </div>
      <div class="scene-card-body">
        <div class="scene-card-title">${escapeHtml(scene.title)}</div>
        <div class="scene-card-character">${escapeHtml(scene.character)}</div>
      </div>
    </a>`;
}

/* ============================================================
   INIT — Detect which page we are on and run appropriate logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;

  if (body.dataset.page === 'index') {
    initGallery();
  } else if (body.dataset.page === 'scene') {
    initScenePage();
  }
});
