// New Life Game engine: scaling, screen navigation, scene rendering, persistence.

const STORAGE_KEY = "newLifeGame:state:v1";

const state = (() => {
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
      };
    }
  } catch (_) {}
  return {
    visited: new Set(),
    hasWon: false,
    charactersWon: new Set(),
    currentCharacter: null,
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

  if (id === "menu") refreshMenuLocks();
  if (id === "scenes") renderSceneSelection();
  if (id === "extras") renderExtras();
}

function closeHelp() {
  const helpBtn = document.querySelector("#help-button");
  if (helpBtn) helpBtn.style.display = "none";
  goToScreen("menu");
}

// ── Menu lock state ───────────────────────────────────────
function refreshMenuLocks() {
  const scenesBtn = document.querySelector("#screen-menu .scenes button");
  const extrasBtn = document.querySelector("#screen-menu .extras button");
  const trueBtn = document.querySelector("#screen-menu .true-ending button");
  const lockedOverlay = document.querySelector("#screen-menu .locked");

  const scenesUnlocked = state.visited.size > 0;
  const extrasUnlocked = state.hasWon;
  const trueUnlocked = state.charactersWon.size >= 3;

  if (scenesBtn) scenesBtn.disabled = !scenesUnlocked;
  if (extrasBtn) extrasBtn.disabled = !extrasUnlocked;
  if (trueBtn) trueBtn.disabled = !trueUnlocked;

  // True-ending tile is fully hidden until unlocked.
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
  saveState();
  playScene(ch.startScene);
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

  // Background can be specified as either:
  //   bg: { image: "images/foo.png" }         ← real artwork; replaces emoji
  //   bg: { gradient: "...", emoji: "🏠" }    ← placeholder gradient + big emoji
  //   bg: { image: "...", gradient: "..." }   ← image with gradient fallback
  const bg = document.createElement("div");
  bg.className = "bg";
  const hasImage = !isRoadSign && scene.bg?.image;

  if (isRoadSign) {
    bg.style.background = "linear-gradient(#a9c8e0, #d0d8df)";
  } else if (hasImage) {
    bg.style.backgroundImage = `url('${scene.bg.image}')`;
    bg.style.backgroundSize = "cover";
    bg.style.backgroundPosition = "center";
    bg.style.backgroundRepeat = "no-repeat";
    if (scene.bg.gradient) bg.style.backgroundColor = scene.bg.gradient;
  } else {
    bg.style.background = scene.bg?.gradient || "#000";
  }

  // Emoji placeholder is hidden once a real image is provided.
  if (!isRoadSign && !hasImage && scene.bg?.emoji) {
    const emoji = document.createElement("div");
    emoji.className = "bg-emoji";
    emoji.textContent = scene.bg.emoji;
    bg.appendChild(emoji);
  }
  root.appendChild(bg);

  if (scene.label) {
    const label = document.createElement("div");
    label.className = "label";
    label.textContent = scene.label;
    root.appendChild(label);
  }

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
    // Ground strip along the bottom (gray bar the character walks on).
    const ground = document.createElement("div");
    ground.className = "ground";
    root.appendChild(ground);

    const sign = document.createElement("div");
    sign.className = "road-sign";

    const board = document.createElement("div");
    board.className = "sign-board";
    // Inline SVG draws the pentagon (rectangle + arrow tip) with a single
    // continuous stroke, so the arrow is visually part of the sign.
    board.innerHTML = `
      <svg viewBox="0 0 420 100" class="sign-shape">
        <defs>
          <linearGradient id="sign-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#dcdcdc" />
            <stop offset="100%" stop-color="#b8b8b8" />
          </linearGradient>
        </defs>
        <polygon points="3,3 340,3 417,50 340,97 3,97"
                 fill="url(#sign-grad)" stroke="#333"
                 stroke-width="3" stroke-linejoin="miter" />
      </svg>
    `;

    const textEl = document.createElement("div");
    textEl.className = "sign-text";
    textEl.textContent = scene.text || "";
    board.appendChild(textEl);

    const firstChoice = (scene.choices || [])[0];
    if (firstChoice) {
      const btn = document.createElement("button");
      btn.className = "choice sign-button pending";
      btn.textContent = firstChoice.label;
      btn.disabled = true;
      btn.addEventListener("click", () => playScene(firstChoice.goto));
      board.appendChild(btn);

      // Fake-loading reveal: button appears after a delay.
      const delay =
        typeof scene.loadingDelay === "number" ? scene.loadingDelay : 3000;
      setTimeout(() => {
        btn.classList.remove("pending");
        btn.disabled = false;
      }, delay);
    }

    sign.appendChild(board);

    const posts = document.createElement("div");
    posts.className = "posts";
    posts.appendChild(document.createElement("div"));
    posts.appendChild(document.createElement("div"));
    sign.appendChild(posts);

    root.appendChild(sign);
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

// Depth-first walk from a starting scene, recording the order each scene is
// first encountered. Used to sort Scene Selection chronologically so each
// branch reads top-to-bottom the way a single playthrough would.
function dfsOrder(startId) {
  const order = new Map();
  let i = 0;
  function visit(id) {
    if (order.has(id) || id.startsWith("__") || !window.SCENES[id]) return;
    order.set(id, i++);
    const scene = window.SCENES[id];
    for (const c of scene.choices || []) if (c.goto) visit(c.goto);
    for (const h of scene.hotspots || []) if (h.goto) visit(h.goto);
  }
  visit(startId);
  return order;
}

// ── Scene selection ───────────────────────────────────────
function renderSceneSelection() {
  const root = document.querySelector("#screen-scenes .lists");
  if (!root) return;
  root.innerHTML = "";

  const groups = [
    { key: "bob", title: "Bob" },
    { key: "willie", title: "Willie" },
    { key: "peter", title: "Peter" },
  ];

  // A scene's character may be a string ("bob") or an array (["bob","willie"])
  // — endings reached from multiple characters appear in each of their columns.
  const sceneInGroup = (scene, key) =>
    Array.isArray(scene.character)
      ? scene.character.includes(key)
      : scene.character === key;

  for (const group of groups) {
    const col = document.createElement("div");
    col.className = "col";

    const h2 = document.createElement("h2");
    h2.textContent = group.title;
    col.appendChild(h2);

    // List every scene in the group (excluding loading interstitials).
    // Visited scenes become clickable entries; unvisited render as "???"
    // placeholders so the player can see how much there is left to explore.
    const allEntries = Object.entries(window.SCENES).filter(
      ([id, scene]) =>
        sceneInGroup(scene, group.key) && scene.template !== "road-sign"
    );

    // Story scenes first, then game-overs, then wins (climactic at the bottom).
    // Within each tier sort chronologically by DFS depth from the character's
    // start scene — so each branch reads in playthrough order.
    const startScene = window.CHARACTERS[group.key]?.startScene;
    const orderMap = startScene ? dfsOrder(startScene) : new Map();
    const rank = (s) =>
      s.ending === "win" ? 2 : s.ending === "game-over" ? 1 : 0;
    allEntries.sort(([idA, a], [idB, b]) => {
      const r = rank(a) - rank(b);
      if (r !== 0) return r;
      return (orderMap.get(idA) ?? Infinity) - (orderMap.get(idB) ?? Infinity);
    });

    for (const [id, scene] of allEntries) {
      if (state.visited.has(id)) {
        const btn = document.createElement("button");
        btn.className = "scene-entry";
        btn.textContent = scene.title || id;
        btn.addEventListener("click", () => playScene(id));
        col.appendChild(btn);
      } else {
        const placeholder = document.createElement("div");
        placeholder.className = "scene-entry unvisited";
        placeholder.textContent = "???";
        col.appendChild(placeholder);
      }
    }

    root.appendChild(col);
  }
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

window.addEventListener("resize", updateScale);
updateScale();
refreshMenuLocks();
goToScreen("menu");
