// New Life Game engine: scaling, screen navigation, scene rendering, persistence.

const STORAGE_KEY = "newLifeGame:state:v1";

const STAT_KEYS = ["intelligence", "money", "fitness"];
const STAT_ICONS = { intelligence: "💡", money: "💰", fitness: "💪" };

function emptyStats() {
  return { intelligence: 0, money: 0, fitness: 0 };
}

const state = (() => {
  // Stats are intentionally NOT persisted — they reset to character defaults
  // each time the player starts a new run via confirmCharacter().
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        visited: new Set(Array.isArray(parsed.visited) ? parsed.visited : []),
        hasWon: !!parsed.hasWon,
        charactersWon: new Set(
          Array.isArray(parsed.charactersWon) ? parsed.charactersWon : []
        ),
        currentCharacter: parsed.currentCharacter || null,
        helpOpened: !!parsed.helpOpened,
        stats: emptyStats(),
      };
    }
  } catch (_) {}
  return {
    visited: new Set(),
    hasWon: false,
    charactersWon: new Set(),
    currentCharacter: null,
    helpOpened: false,
    stats: emptyStats(),
  };
})();

function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        visited: [...state.visited],
        hasWon: state.hasWon,
        charactersWon: [...state.charactersWon],
        currentCharacter: state.currentCharacter,
        helpOpened: state.helpOpened,
      })
    );
  } catch (_) {}
}

// ── Scale to fit 16:9 ─────────────────────────────────────
function updateScale() {
  if ((window.innerWidth * 9) / 16 > window.innerHeight) {
    document.documentElement.style.fontSize = "0.16vh";
    document.body.style.height = "100vh";
    document.body.style.width = "unset";
  } else {
    document.documentElement.style.fontSize = "0.09vw";
    document.body.style.height = "unset";
    document.body.style.width = "100vw";
  }
}

// ── Section switching ─────────────────────────────────────
function goToScreen(id) {
  document
    .querySelectorAll("section")
    .forEach((section) => (section.style.display = "none"));
  const target = document.querySelector("#screen-" + id);
  if (target) target.style.display = "block";

  if (id === "help" && !state.helpOpened) {
    state.helpOpened = true;
    saveState();
  }
  if (id === "menu") refreshMenuLocks();
  if (id === "scenes") renderSceneSelection();
  if (id === "extras") renderExtras();
}

function closeHelp() {
  goToScreen("menu");
}

// ── Menu lock state ───────────────────────────────────────
function refreshMenuLocks() {
  const scenesBtn = document.querySelector("#screen-menu .scenes button");
  const extrasBtn = document.querySelector("#screen-menu .extras button");
  const trueBtn = document.querySelector("#screen-menu .true-ending button");
  const lockedOverlay = document.querySelector("#screen-menu .locked");
  const helpContainer = document.querySelector("#screen-menu .help");

  const scenesUnlocked = state.visited.size > 0;
  const extrasUnlocked = state.hasWon;
  // True Ending takes over HELP's menu slot once the player has opened
  // HELP at least once AND won with all three characters.
  const trueUnlocked = state.charactersWon.size >= 3 && state.helpOpened;

  if (scenesBtn) scenesBtn.disabled = !scenesUnlocked;
  if (extrasBtn) extrasBtn.disabled = !extrasUnlocked;
  if (trueBtn) trueBtn.disabled = !trueUnlocked;

  // HELP button disappears permanently once visited; True Ending may
  // surface in its place if also unlocked.
  if (helpContainer) {
    helpContainer.style.display = state.helpOpened ? "none" : "";
  }

  const trueContainer = document.querySelector("#screen-menu .true-ending");
  if (trueContainer) trueContainer.classList.toggle("unlocked", trueUnlocked);

  if (lockedOverlay) {
    if (scenesUnlocked && extrasUnlocked) {
      lockedOverlay.classList.add("hidden");
    } else {
      lockedOverlay.classList.remove("hidden");
    }
  }
}

// ── Confirm screens ───────────────────────────────────────
function confirmCharacter(characterId) {
  const ch = window.CHARACTERS[characterId];
  if (!ch) return;
  // Remember which character the player is currently living, so a `win` ending
  // can credit it. Drives the True Ending unlock (need all 3 character wins).
  state.currentCharacter = characterId;
  // Seed stats from the start scene's declared stats (Model B: scene.stats is
  // the full state, not a delta). Pre-setting here means the start scene's
  // initial render matches state, avoiding a flicker.
  state.stats = statsForScene(window.SCENES[ch.startScene]);
  saveState();
  playScene(ch.startScene);
}

// Pull a scene's full declared stats; fall back to all-zero if missing.
function statsForScene(scene) {
  const out = emptyStats();
  if (scene?.stats) {
    for (const k of STAT_KEYS) if (scene.stats[k]) out[k] = 1;
  }
  return out;
}

// ── Scene rendering ───────────────────────────────────────
function playScene(id) {
  // Special pseudo-targets used by scene choices for control flow.
  if (id === "__menu__") return goToScreen("menu");
  if (id === "__extras__") return goToScreen("extras");

  const scene = window.SCENES[id];
  if (!scene) {
    console.error("Unknown scene:", id);
    return goToScreen("menu");
  }

  state.visited.add(id);
  if (scene.ending === "win") {
    state.hasWon = true;
    if (
      state.currentCharacter &&
      ["bob", "willie", "peter"].includes(state.currentCharacter)
    ) {
      state.charactersWon.add(state.currentCharacter);
    }
  }
  saveState();

  const root = document.querySelector("#screen-story");
  root.innerHTML = "";

  const isRoadSign = scene.template === "road-sign";

  // Background: scene.bg is a path to a full-frame image (one of BG.*). It
  // covers the scene area. Road-sign scenes use it as the sky behind the sign.
  // The .bg container keeps a dark fill so a missing/failed image isn't jarring.
  const bg = document.createElement("div");
  bg.className = "bg";
  if (scene.bg) {
    const img = document.createElement("img");
    img.className = "bg-image";
    img.src = scene.bg;
    img.alt = "";
    img.onerror = () => img.remove();
    bg.appendChild(img);
  }
  root.appendChild(bg);

  // Decorative overlays — absolutely positioned in scene-coordinate (rem)
  // units, same coordinate system as hotspots. Each failed image removes
  // itself so missing assets degrade silently to the base background.
  if (Array.isArray(scene.overlays)) {
    for (const ov of scene.overlays) {
      const el = document.createElement("img");
      el.className = "overlay";
      el.src = ov.image;
      el.alt = "";
      el.style.left = ov.x + "rem";
      el.style.top = ov.y + "rem";
      el.style.width = ov.w + "rem";
      el.style.height = ov.h + "rem";
      el.onerror = () => el.remove();
      root.appendChild(el);
    }
  }

  if (scene.label) {
    const label = document.createElement("div");
    label.className = "label";
    label.textContent = scene.label;
    root.appendChild(label);
  }

  // Stat tracker — top-left HUD. Hidden on loading interstitials and endings
  // (the scene reads as a result screen there, not active gameplay).
  const showStats = !isRoadSign && !scene.ending;
  if (showStats) renderStatTracker(root, scene);

  // Portrait: explicit scene.portrait wins, otherwise fall back to the
  // current character's portrait (so loading screens auto-display the
  // right face without each loading scene hard-coding it).
  const portraitSrc =
    scene.portrait ||
    (scene.character && window.CHARACTERS[scene.character]?.portrait);
  if (portraitSrc) {
    const img = document.createElement("img");
    img.className = "portrait";
    img.src = portraitSrc;
    img.alt = "";
    if (scene.walk) {
      img.classList.add("walking");
      if (scene.walk.from !== undefined)
        img.style.setProperty("--walk-from", scene.walk.from + "%");
      if (scene.walk.to !== undefined)
        img.style.setProperty("--walk-to", scene.walk.to + "%");
      const delay =
        typeof scene.loadingDelay === "number" ? scene.loadingDelay : 3000;
      img.style.setProperty("--walk-duration", delay + "ms");
    }
    root.appendChild(img);
  }

  // Optional second portrait on the right (used by Loser-vs-Jam-Dude fight).
  if (scene.portraitRight) {
    const img = document.createElement("img");
    img.className = "portrait right";
    img.src = scene.portraitRight;
    img.alt = "";
    root.appendChild(img);
  }

  // Hidden hotspots — discoverable but quiet. The `hint` emoji is rendered
  // at low opacity so a curious player can spot it, with a hover boost.
  if (Array.isArray(scene.hotspots)) {
    for (const spot of scene.hotspots) {
      const btn = document.createElement("button");
      btn.className = "hotspot";
      btn.style.left = spot.x + "rem";
      btn.style.top = spot.y + "rem";
      btn.style.width = spot.w + "rem";
      btn.style.height = spot.h + "rem";
      if (spot.hint) {
        btn.textContent = spot.hint;
        btn.title = spot.hint;
      }
      btn.addEventListener("click", () => playScene(spot.goto));
      root.appendChild(btn);
    }
  }

  if (isRoadSign) {
    const textEl = document.createElement("div");
    textEl.className = "loading-text";
    textEl.textContent = scene.text || "";
    root.appendChild(textEl);

    const firstChoice = (scene.choices || [])[0];
    if (firstChoice) {
      const btn = document.createElement("button");
      btn.className = "choice loading-button pending";
      btn.textContent = firstChoice.label;
      btn.disabled = true;
      btn.addEventListener("click", () => playScene(firstChoice.goto));
      root.appendChild(btn);

      // Fake-loading reveal: button appears after a delay.
      const delay =
        typeof scene.loadingDelay === "number" ? scene.loadingDelay : 3000;
      setTimeout(() => {
        btn.classList.remove("pending");
        btn.disabled = false;
      }, delay);
    }
  } else {
    if (scene.text) {
      const textEl = document.createElement("div");
      textEl.className = scene.speaker ? "speech-bubble" : "narration";
      textEl.textContent = scene.text;
      root.appendChild(textEl);
    }

    if (Array.isArray(scene.choices) && scene.choices.length) {
      const bar = document.createElement("div");
      bar.className = "choice-bar";
      for (const choice of scene.choices) {
        const btn = document.createElement("button");
        btn.className = "choice";
        btn.textContent = choice.label;
        btn.addEventListener("click", () => playScene(choice.goto));
        bar.appendChild(btn);
      }
      root.appendChild(bar);
    }
  }

  // Direct screen switch (no goToScreen, which would re-trigger menu logic).
  document
    .querySelectorAll("section")
    .forEach((section) => (section.style.display = "none"));
  root.style.display = "block";
}

// Mounts the top-left stat HUD. Pending changes from `scene.stats` are applied
// one tick later so the icon visibly animates from its old state to its new one.
function renderStatTracker(root, scene) {
  const bar = document.createElement("div");
  bar.className = "stat-tracker";

  const items = {};
  for (const key of STAT_KEYS) {
    const item = document.createElement("div");
    item.className = "stat-item" + (state.stats[key] ? " active" : "");
    item.dataset.stat = key;
    item.textContent = STAT_ICONS[key];
    bar.appendChild(item);
    items[key] = item;
  }
  root.appendChild(bar);

  if (!scene.stats) return;
  // Defer so the initial render paints with the OLD value before flipping —
  // otherwise the transition has nothing to interpolate from. Model B:
  // scene.stats is the complete state at this scene, so any stat omitted from
  // scene.stats is treated as 0 (full replacement, not partial).
  setTimeout(() => {
    for (const key of STAT_KEYS) {
      const next = scene.stats[key] ? 1 : 0;
      if (state.stats[key] === next) continue;
      state.stats[key] = next;
      const el = items[key];
      el.classList.toggle("active", next === 1);
      el.classList.remove("changing");
      // Force reflow so re-adding the class restarts the animation.
      void el.offsetWidth;
      el.classList.add("changing");
    }
  }, 400);
}

// ── Scene selection (tree view) ───────────────────────────
// Which character's tree is currently shown. Persisted in-memory only; defaults
// to the last-played character or Bob.
let scenesTab = null;

function selectScenesTab(character) {
  scenesTab = character;
  renderSceneSelection();
}

// Tree-graph geometry, all in the game's logical rem units.
const SCENE_NODE_W = 210;
const SCENE_NODE_H = 64;
const SCENE_H_GAP = 18;
const SCENE_V_GAP = 56;
const SCENE_PAD = 40;

function renderSceneSelection() {
  const root = document.querySelector("#screen-scenes .scene-tree");
  if (!root) return;

  // Default tab on first open: Bob.
  if (!scenesTab) {
    scenesTab = "bob";
  }

  // Highlight active toggle.
  document.querySelectorAll("#screen-scenes .char-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.char === scenesTab);
  });

  enableScenePan(root);
  root.innerHTML = "";

  const startScene = window.CHARACTERS[scenesTab]?.startScene;
  if (!startScene || !window.SCENES[startScene]) return;

  // Build the tree, then assign positions in a family-tree layout: the root
  // sits centered at the top, and each subtree claims a horizontal band wide
  // enough to fit all its leaves without overlap.
  const tree = buildSceneTree(startScene);
  if (!tree) return;
  let maxDepth = 0;
  (function place(node, leftEdge, depth) {
    if (depth > maxDepth) maxDepth = depth;
    node.x = leftEdge + node.width / 2;
    node.y = depth * (SCENE_NODE_H + SCENE_V_GAP);
    let off = leftEdge;
    for (const child of node.children) {
      place(child, off, depth + 1);
      off += child.width;
    }
  })(tree, 0, 0);

  const totalWidth = tree.width + SCENE_PAD * 2;
  const totalHeight =
    (maxDepth + 1) * (SCENE_NODE_H + SCENE_V_GAP) + SCENE_PAD * 2;
  const ox = SCENE_PAD;
  const oy = SCENE_PAD;

  const canvas = document.createElement("div");
  canvas.className = "scene-canvas";
  canvas.style.width = totalWidth + "rem";
  canvas.style.height = totalHeight + "rem";

  // Arrows: cubic curves from each parent's bottom-center to each child's
  // top-center, with an arrowhead marker at the child end.
  const SVG_NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "scene-arrows");
  svg.setAttribute("viewBox", `0 0 ${totalWidth} ${totalHeight}`);
  svg.setAttribute("preserveAspectRatio", "none");
  const defs = document.createElementNS(SVG_NS, "defs");
  const marker = document.createElementNS(SVG_NS, "marker");
  marker.setAttribute("id", "scene-arrowhead");
  marker.setAttribute("viewBox", "0 0 10 10");
  marker.setAttribute("refX", "9");
  marker.setAttribute("refY", "5");
  marker.setAttribute("markerUnits", "userSpaceOnUse");
  marker.setAttribute("markerWidth", "10");
  marker.setAttribute("markerHeight", "10");
  marker.setAttribute("orient", "auto");
  const head = document.createElementNS(SVG_NS, "path");
  head.setAttribute("d", "M0 0 L10 5 L0 10 z");
  head.setAttribute("fill", "#a04050");
  marker.appendChild(head);
  defs.appendChild(marker);
  svg.appendChild(defs);
  (function drawArrows(node) {
    for (const child of node.children) {
      const x1 = node.x + ox;
      const y1 = node.y + SCENE_NODE_H / 2 + oy;
      const x2 = child.x + ox;
      const y2 = child.y - SCENE_NODE_H / 2 + oy;
      const midY = (y1 + y2) / 2;
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("class", "scene-arrow");
      path.setAttribute(
        "d",
        `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`
      );
      path.setAttribute("marker-end", "url(#scene-arrowhead)");
      svg.appendChild(path);
      drawArrows(child);
    }
  })(tree);
  canvas.appendChild(svg);

  // Nodes: each scene-entry positioned absolutely; SVG sits underneath so
  // arrows appear behind tiles without obscuring titles.
  (function placeNodes(node) {
    const entry = buildSceneEntry(node.id, node.scene);
    entry.style.left = node.x - SCENE_NODE_W / 2 + ox + "rem";
    entry.style.top = node.y - SCENE_NODE_H / 2 + oy + "rem";
    entry.style.width = SCENE_NODE_W + "rem";
    entry.style.height = SCENE_NODE_H + "rem";
    canvas.appendChild(entry);
    for (const child of node.children) placeNodes(child);
  })(tree);

  root.appendChild(canvas);

  // Center the root horizontally in the viewport on first paint. scrollLeft
  // is in CSS pixels, so derive the px-per-rem ratio from the canvas's
  // measured width.
  requestAnimationFrame(() => {
    const rect = canvas.getBoundingClientRect();
    const pxPerRem = rect.width / totalWidth || 1;
    root.scrollLeft = (tree.x + ox) * pxPerRem - root.clientWidth / 2;
    root.scrollTop = 0;
  });
}

function buildSceneTree(startId) {
  const visited = new Set();
  function build(id) {
    if (visited.has(id)) return null;
    const scene = window.SCENES[id];
    if (!scene) return null;
    visited.add(id);

    const childIds = [];
    for (const c of scene.choices || []) {
      if (c.goto && !c.goto.startsWith("__") && !visited.has(c.goto)) {
        childIds.push(c.goto);
      }
    }
    for (const h of scene.hotspots || []) {
      if (h.goto && !h.goto.startsWith("__") && !visited.has(h.goto)) {
        childIds.push(h.goto);
      }
    }

    const node = { id, scene, children: [], width: 0 };
    let total = 0;
    for (const cid of childIds) {
      const child = build(cid);
      if (!child) continue;
      node.children.push(child);
      total += child.width;
    }
    node.width = Math.max(SCENE_NODE_W + SCENE_H_GAP, total);
    return node;
  }
  return build(startId);
}

// Mouse-drag panning of the scene-tree viewport. The viewport itself
// persists across re-renders, so we bind the listener exactly once.
function enableScenePan(viewport) {
  if (viewport.dataset.panBound) return;
  viewport.dataset.panBound = "1";
  // Suppress native HTML5 drag (image ghosts, link drag) so it doesn't
  // hijack our drag-to-pan.
  viewport.addEventListener("dragstart", (e) => e.preventDefault());
  viewport.addEventListener("mousedown", (e) => {
    // Clicking a scene tile should play the scene, not start a pan.
    if (e.target.closest(".scene-entry")) return;
    e.preventDefault();
    viewport.classList.add("dragging");
    const startX = e.clientX;
    const startY = e.clientY;
    const scrollX = viewport.scrollLeft;
    const scrollY = viewport.scrollTop;
    function move(ev) {
      viewport.scrollLeft = scrollX - (ev.clientX - startX);
      viewport.scrollTop = scrollY - (ev.clientY - startY);
    }
    function up() {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      viewport.classList.remove("dragging");
    }
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  });
}

function buildSceneEntry(id, scene) {
  const seen = state.visited.has(id);
  const entry = document.createElement(seen ? "button" : "div");
  entry.className = "scene-entry" + (seen ? "" : " unvisited");

  const thumb = document.createElement("div");
  thumb.className = "scene-thumb";
  if (seen && scene.bg) {
    const img = document.createElement("img");
    img.src = scene.bg;
    img.alt = "";
    img.onerror = () => img.remove();
    thumb.appendChild(img);
  }
  entry.appendChild(thumb);

  const title = document.createElement("span");
  title.className = "scene-title";
  title.textContent = seen ? scene.title || id : "???";
  entry.appendChild(title);

  if (seen) {
    entry.addEventListener("click", () => {
      // Pre-set state.stats so the scene's tracker doesn't briefly show
      // stale values from the previous run before the deferred apply.
      state.stats = statsForScene(scene);
      playScene(id);
    });
  }
  return entry;
}

// ── Extras menu ───────────────────────────────────────────
function renderExtras() {
  // Static markup; nothing dynamic needed beyond the tile click handler,
  // which is wired in index.html. Stub exists in case we add more later.
}

// ── Init ──────────────────────────────────────────────────
window.updateScale = updateScale;
window.goToScreen = goToScreen;
window.closeHelp = closeHelp;
window.confirmCharacter = confirmCharacter;
window.playScene = playScene;
window.selectScenesTab = selectScenesTab;

window.addEventListener("resize", updateScale);
mountScreens();
updateScale();
refreshMenuLocks();
goToScreen("menu");
