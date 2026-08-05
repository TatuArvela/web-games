#!/usr/bin/env node
// Validator for the New Life Game scene graph.
//
// Walks each character's start scene and reports any violation of the design
// invariants. Run from the game's directory:
//
//   node tools/validate-scenes.js
//
// Invariants enforced:
//   1. Tree shape         — every scene has exactly one incoming edge.
//   2. No cross-character — every scene belongs to a single character (no
//                           shared destinations between bob/willie/peter).
//   3. Stat consistency   — every gameplay scene reaches the same stat state
//                           via every path that can lead to it.
//   4. Reachable          — every scene defined in SCENES is reachable from
//                           some character's start (or the True Ending root).

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const STAT_KEYS = ["intelligence", "money", "fitness"];

function loadGame() {
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  const files = [
    "characters.js",
    "scenes/index.js",
    "scenes/shared.js",
    "scenes/bob.js",
    "scenes/willie.js",
    "scenes/peter.js",
    "scenes/extras.js",
  ];
  for (const file of files) {
    const src = fs.readFileSync(path.join(ROOT, file), "utf8");
    vm.runInContext(src, sandbox, { filename: file });
  }
  return {
    CHARACTERS: sandbox.window.CHARACTERS,
    SCENES: sandbox.window.SCENES,
  };
}

function startingStats(deltas) {
  const out = { intelligence: 0, money: 0, fitness: 0 };
  if (!deltas) return out;
  for (const k of STAT_KEYS) if ((deltas[k] || 0) > 0) out[k] = 1;
  return out;
}

function sceneStats(scene) {
  // Model B: scene.stats is the COMPLETE state at this scene. Missing keys
  // default to 0. Endings and road-signs don't need stats (tracker hidden).
  const out = { intelligence: 0, money: 0, fitness: 0 };
  if (scene && scene.stats) {
    for (const k of STAT_KEYS) if (scene.stats[k]) out[k] = 1;
  }
  return out;
}

function fmt(s) {
  return `{${s.intelligence}/${s.money}/${s.fitness}}`;
}

function statsKey(s) {
  return STAT_KEYS.map((k) => s[k]).join(",");
}

const ROOTS = {
  bob: { startScene: null, kind: "character" },
  willie: { startScene: null, kind: "character" },
  peter: { startScene: null, kind: "character" },
  extras: { startScene: "fight-intro", kind: "extras" },
  shared: { startScene: "convergence", kind: "shared" },
};

function main() {
  const { CHARACTERS, SCENES } = loadGame();
  ROOTS.bob.startScene = CHARACTERS.bob?.startScene;
  ROOTS.willie.startScene = CHARACTERS.willie?.startScene;
  ROOTS.peter.startScene = CHARACTERS.peter?.startScene;

  // sceneId -> [{ from, character, stats }]
  const incoming = {};
  // sceneId -> first-seen { character, stats }
  const first = {};

  function record(parentId, childId, char, stats) {
    if (!childId || childId.startsWith("__")) return;
    if (!incoming[childId]) incoming[childId] = [];
    incoming[childId].push({ from: parentId, character: char, stats });
  }

  function walk(sceneId, char) {
    if (!sceneId || sceneId.startsWith("__")) return;
    const scene = SCENES[sceneId];
    if (!scene) return;
    const statsOut = sceneStats(scene);
    if (first[sceneId]) return; // visit each scene once for recursion control
    first[sceneId] = { character: char, stats: statsOut };
    if (scene.ending) return;
    for (const c of scene.choices || []) {
      if (c.goto) {
        record(sceneId, c.goto, char, sceneStats(SCENES[c.goto]));
        walk(c.goto, char);
      }
    }
    for (const h of scene.hotspots || []) {
      if (h.goto) {
        record(sceneId, h.goto, char, sceneStats(SCENES[h.goto]));
        walk(h.goto, char);
      }
    }
  }

  // Walk each root.
  for (const [name, root] of Object.entries(ROOTS)) {
    if (!root.startScene) continue;
    // First mark the root itself as "incoming from null" so it counts as having one parent.
    incoming[root.startScene] = incoming[root.startScene] || [];
    incoming[root.startScene].push({
      from: null,
      character: name,
      stats: sceneStats(SCENES[root.startScene]),
    });
    walk(root.startScene, name);
  }

  // --- Reports ---
  const violations = {
    multiParent: [], // scenes with >1 incoming edge
    multiCharacter: [], // scenes reached from multiple characters
    statConflict: [], // scenes reached with differing stats
    unreachable: [], // scenes defined but not reached
    missingStats: [], // gameplay scenes without explicit stats: {...}
    missingBg: [], // scenes without a background image
  };

  for (const [id, edges] of Object.entries(incoming)) {
    // Dedupe parents — multiple choices/hotspots in the SAME parent scene that
    // all point to this child is fine. Only distinct parent SCENES violate the
    // tree rule.
    const parents = [
      ...new Set(edges.filter((e) => e.from !== null).map((e) => e.from)),
    ];
    if (parents.length > 1) {
      violations.multiParent.push({ id, parents });
    }
    const chars = new Set(edges.map((e) => e.character));
    if (chars.size > 1) {
      violations.multiCharacter.push({ id, characters: [...chars] });
    }
    const statKeys = new Set(edges.map((e) => statsKey(e.stats)));
    if (statKeys.size > 1) {
      violations.statConflict.push({
        id,
        states: edges.map((e) => ({
          stats: e.stats,
          from: e.from,
          character: e.character,
        })),
      });
    }
  }

  for (const id of Object.keys(SCENES)) {
    if (!incoming[id]) violations.unreachable.push(id);
  }

  // Stats are only required for character-specific gameplay scenes — endings,
  // road-signs, and meta scenes (extras, shared) don't show the stat tracker.
  for (const [id, scene] of Object.entries(SCENES)) {
    if (scene.ending) continue;
    if (scene.template === "road-sign") continue;
    if (scene.character === "extras" || scene.character === "shared") continue;
    if (!scene.stats) violations.missingStats.push(id);
  }

  // Every scene must declare a background image (bg is a path string).
  for (const [id, scene] of Object.entries(SCENES)) {
    if (typeof scene.bg !== "string" || !scene.bg) violations.missingBg.push(id);
  }

  // --- Print ---
  const heading = (s) => console.log(`\n=== ${s} ===`);

  heading("Multi-parent scenes (violates tree invariant)");
  if (!violations.multiParent.length) console.log("(none)");
  for (const v of violations.multiParent) {
    console.log(`  ${v.id}  ← parents: ${v.parents.join(", ")}`);
  }

  heading("Multi-character scenes (violates no-sharing)");
  if (!violations.multiCharacter.length) console.log("(none)");
  for (const v of violations.multiCharacter) {
    console.log(`  ${v.id}  ← reached from: ${v.characters.join(", ")}`);
  }

  heading("Stat conflicts (same scene, different stats by path)");
  if (!violations.statConflict.length) console.log("(none)");
  for (const v of violations.statConflict) {
    console.log(`  ${v.id}`);
    for (const s of v.states) {
      console.log(`    ${fmt(s.stats)} ← ${s.from || "<root>"} (${s.character})`);
    }
  }

  heading("Unreachable scenes");
  if (!violations.unreachable.length) console.log("(none)");
  for (const id of violations.unreachable) console.log(`  ${id}`);

  heading("Gameplay scenes missing explicit stats:");
  if (!violations.missingStats.length) console.log("(none)");
  for (const id of violations.missingStats) console.log(`  ${id}`);

  heading("Scenes missing a background image:");
  if (!violations.missingBg.length) console.log("(none)");
  for (const id of violations.missingBg) console.log(`  ${id}`);

  heading("Expected stats per scene (computed by traversal)");
  for (const [id, info] of Object.entries(first)) {
    console.log(`  ${id.padEnd(34)} ${fmt(info.stats)}  (${info.character})`);
  }

  // Summary
  console.log("");
  console.log("=== Summary ===");
  console.log(`  multi-parent:    ${violations.multiParent.length}`);
  console.log(`  multi-character: ${violations.multiCharacter.length}`);
  console.log(`  stat conflicts:  ${violations.statConflict.length}`);
  console.log(`  unreachable:     ${violations.unreachable.length}`);
  console.log(`  missing stats:   ${violations.missingStats.length}`);
  console.log(`  missing bg:      ${violations.missingBg.length}`);

  // Exit non-zero if any violations.
  const total =
    violations.multiParent.length +
    violations.multiCharacter.length +
    violations.statConflict.length +
    violations.unreachable.length +
    violations.missingBg.length;
  process.exit(total === 0 ? 0 : 1);
}

main();
