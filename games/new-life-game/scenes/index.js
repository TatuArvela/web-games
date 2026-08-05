// Scene-graph scaffolding for New Life Game.
//
// Each character file (loaded after this one) calls registerScenes(...) with
// its own per-character scenes. Together they populate window.SCENES, which
// engine.js consumes.
//
// Invariants (validated by tools/validate-scenes.js):
//   • Tree shape — every scene has exactly one parent (no merges).
//     Side-quest detours that previously looped back to a hub now terminate
//     at their own dead-end scene.
//   • Per-character — each scene belongs to exactly one character; no
//     character: array values. Game-overs reached from multiple characters
//     (game-over-bus, game-over-deleted, game-over-indecisive) are split.
//   • Stats are full state — scene.stats must include {intelligence, money,
//     fitness} for every gameplay scene. The engine treats it as the
//     complete state to set on entry (not a delta).
//
// Scene shape:
//   {
//     character: "bob" | "willie" | "peter" | "extras" | "shared",
//     title:     "human-readable title for Scene Selection",
//     bg:        one of BG.* — a path to a full-frame background image,
//     text:      "what's on screen",
//     portrait:  "images/bob.png" | undefined,
//     stats:     { intelligence: 0|1, money: 0|1, fitness: 0|1 },
//     choices:   [ { label, goto } ],
//     hotspots:  [ { x, y, w, h, goto, hint? } ],
//     overlays:  [ { image, x, y, w, h } ],
//     ending:    "win" | "game-over" | undefined,
//   }
//
// Game logical space is ~1111x625 rem (16:9 body, scaled by updateScale()).

// Each background is a path to a full-frame image in images/bg/. The engine
// stretches it to cover the 16:9 scene area. Every scene must name one.
const BG = {
  adSpace: "images/bg/adSpace.png",
  bar: "images/bg/bar.png",
  brickWall: "images/bg/brickWall.png",
  bus: "images/bg/bus.png",
  busCrash: "images/bg/busCrash.png",
  busInside: "images/bg/busInside.png",
  cosmos: "images/bg/cosmos.png",
  crash: "images/bg/crash.png",
  debug: "images/bg/debug.png",
  depot: "images/bg/depot.png",
  doctor: "images/bg/doctor.png",
  fight: "images/bg/fight.png",
  flowerShop: "images/bg/flowerShop.png",
  gameOver: "images/bg/gameOver.png",
  garden: "images/bg/garden.png",
  glow: "images/bg/glow.png",
  gym: "images/bg/gym.png",
  inside: "images/bg/inside.png",
  insideWork: "images/bg/insideWork.png",
  jam: "images/bg/jam.png",
  loading: "images/bg/loadingSky.png",
  outside: "images/bg/outside.png",
  outsideWork: "images/bg/outsideWork.png",
  park: "images/bg/park.png",
  street: "images/bg/street.png",
  trip: "images/bg/trip.png",
  tulipRoom: "images/bg/tulipRoom.png",
  win: "images/bg/win.png",
};

const BACK_TO_MENU = { label: "Back to menu", goto: "__menu__" };

// Reusable loading-screen factory: road-sign + walking character.
//   step 1 — character enters from off-screen-left, walks to the left of the sign
//   step 2 — character continues across, walking out off-screen-right
function loadingStep(character, next, opts = {}) {
  const step = opts.step || 1;
  const defaultText = step === 2 ? "Still loading..." : "Loading...";
  const defaultWalk =
    step === 2 ? { from: 15, to: 110 } : { from: -15, to: 15 };
  const text = opts.text || defaultText;
  return {
    character,
    title: text,
    template: "road-sign",
    bg: BG.loading,
    text,
    walk: opts.walk || defaultWalk,
    choices: [{ label: "Continue", goto: next }],
  };
}

// Per-character files call this to register their scenes onto window.SCENES.
function registerScenes(map) {
  window.SCENES = window.SCENES || {};
  for (const [id, scene] of Object.entries(map)) {
    if (window.SCENES[id]) {
      console.error("Duplicate scene id:", id);
    }
    window.SCENES[id] = scene;
  }
}

window.BG = BG;
window.BACK_TO_MENU = BACK_TO_MENU;
window.loadingStep = loadingStep;
window.registerScenes = registerScenes;
window.SCENES = {};
