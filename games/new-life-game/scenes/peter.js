// Peter's scene tree.
//
//   peter-start  {0,0,0}
//   └── load → peter-home  {0,0,0}
//       ├── "Slip out the back" → peter-depot  {0,0,0}
//       │   ├── "Start your shift" → peter-bus  {0,0,0}
//       │   │   ├── "Into a building" → crash-building → game-over-crash-building
//       │   │   ├── "Into a pedestrian" → crash-bob → game-over-crash-bob
//       │   │   └── 🟢 → peter-debug-menu  {0,0,0}
//       │   │       ├── MAX_STATS → peter-max-stats
//       │   │       │   ├── Yes → peter-max-confirmed → game-over-cheat
//       │   │       │   └── …no → peter-max-honest → walk-away  {1,0,0} → game-over-walk-away
//       │   │       ├── DELETE_REALITY → peter-glitch → game-over-deleted
//       │   │       └── ??? → peter-clone-experiment
//       │   │           ├── Duplicate → peter-duplicate → game-over-infinite
//       │   │           └── Fight     → peter-fight-clone → game-over-clone
//       │   ├── "Visit the doctor" → peter-doctor → mri → treatment
//       │   │   ├── injection → peter-cured-fridge  {1,0,1} → peter-settlement  {1,1,1} → WIN-CURED
//       │   │   └── Glow Package → game-over-radiation-glow
//       │   ├── ✨ → peter-lick-bus → peter-pillar → peter-pillar-back  {1,0,0} → game-over-pillar
//       │   └── 🔴 → peter-meltdown-lever → game-over-radiation-meltdown
//       ├── "Answer the door" → peter-neighbor → game-over-quiet
//       ├── "Uhh what?" → game-over-indecisive
//       └── 📞 → peter-555 → game-over-555

(function () {
  const { BG, BACK_TO_MENU, loadingStep, registerScenes } = window;
  const PORTRAIT = "images/peter.png";

  const S = (overrides) => ({
    character: "peter",
    portrait: PORTRAIT,
    ...overrides,
  });
  const G = (title, bg, text) => ({
    character: "peter",
    title,
    bg,
    text,
    ending: "game-over",
    choices: [BACK_TO_MENU],
  });
  const STATS_ZERO = { intelligence: 0, money: 0, fitness: 0 };
  const STATS_INT = { intelligence: 1, money: 0, fitness: 0 };
  const STATS_INT_FIT = { intelligence: 1, money: 0, fitness: 1 };
  const STATS_FULL = { intelligence: 1, money: 1, fitness: 1 };

  registerScenes({
    "peter-start": S({
      title: "Let's go!",
      bg: BG.outsideWork,
      text:
        "You are Peter. You drive a bus. You wanted to be a pilot. Pilots " +
        "can't glow. Let's go!",
      stats: STATS_ZERO,
      choices: [
        { label: "OK", goto: "peter-load-1" },
        { label: "Uhh what?", goto: "peter-game-over-indecisive" },
      ],
    }),
    "peter-load-1": loadingStep("peter", "peter-load-2"),
    "peter-load-2": loadingStep("peter", "peter-home", { step: 2 }),

    "peter-home": S({
      title: "Apartment",
      bg: BG.inside,
      text:
        "Your apartment hums. The fridge hums louder. A knock at the door — " +
        "probably the neighbor, probably about the glow.",
      stats: STATS_ZERO,
      choices: [
        { label: "Answer the door", goto: "peter-neighbor" },
        { label: "Slip out the back", goto: "peter-depot" },
      ],
      hotspots: [
        { x: 820, y: 380, w: 60, h: 80, goto: "peter-555", hint: "📞" },
      ],
    }),

    "peter-neighbor": S({
      title: "Neighbor",
      bg: BG.inside,
      text:
        '"Peter. Your fridge is glowing again." "That\'s a feature." "It\'s ' +
        'eating my fridge." You close the door, very gently. The neighbor ' +
        "keeps knocking. The fridge keeps glowing. Time, however, does not.",
      stats: STATS_ZERO,
      choices: [{ label: "...", goto: "peter-game-over-quiet" }],
    }),

    "peter-555": S({
      title: "555-LIFE",
      bg: BG.cosmos,
      text:
        'By the phone, a sticky note: "555-LIFE." You dial. A voice answers, ' +
        'calm, ancient: "...we\'ve been waiting for you, Peter." Click. Dial ' +
        "tone. The line has gone cold but you have not.",
      stats: STATS_ZERO,
      choices: [{ label: "...", goto: "peter-game-over-555" }],
    }),

    "peter-depot": S({
      title: "Bus depot",
      bg: BG.depot,
      text:
        "The bus depot. Your bus glows softly. So do you. So does everything.",
      stats: STATS_ZERO,
      choices: [
        { label: "Start your shift", goto: "peter-bus" },
        { label: "Visit the doctor", goto: "peter-doctor" },
      ],
      hotspots: [
        { x: 920, y: 100, w: 40, h: 40, goto: "peter-lick-bus", hint: "✨" },
        { x: 100, y: 480, w: 40, h: 60, goto: "peter-meltdown-lever", hint: "🔴" },
      ],
    }),

    "peter-lick-bus": S({
      title: "Lick the bus",
      bg: BG.glow,
      text:
        "You lick the bus. Absorbing radiation feels GOOD. You start to glow.",
      stats: STATS_ZERO,
      choices: [{ label: "Glow harder", goto: "peter-pillar" }],
    }),
    "peter-pillar": S({
      title: "Pillar of light",
      bg: BG.glow,
      text:
        "You are a pillar of pure radioactive energy. The depot vibrates " +
        "respectfully.",
      stats: STATS_ZERO,
      choices: [{ label: "Transcend", goto: "peter-pillar-back" }],
    }),
    "peter-pillar-back": S({
      title: "Returned",
      bg: BG.cosmos,
      text:
        "Transcendence is cold. You descend back into your body, wiser, " +
        "dimmer, somehow taller. The fridge calls your name. The rent does too.",
      stats: STATS_INT,
      choices: [{ label: "...", goto: "peter-game-over-pillar" }],
    }),

    "peter-meltdown-lever": {
      character: "peter",
      title: "Meltdown",
      bg: BG.glow,
      stats: STATS_ZERO,
      text:
        "You pull the red lever. Klaxons. Heat. The depot melts. You melt. " +
        "Everyone melts.",
      choices: [{ label: "...", goto: "peter-game-over-radiation-meltdown" }],
    },

    "peter-bus": S({
      title: "Bus emergency",
      bg: BG.busInside,
      text: "Your brakes don't work. You must choose. Now.",
      stats: STATS_ZERO,
      choices: [
        { label: "Into a building", goto: "peter-crash-building" },
        { label: "Into a pedestrian", goto: "peter-crash-bob" },
      ],
      hotspots: [
        { x: 970, y: 80, w: 24, h: 24, goto: "peter-debug-menu", hint: "🟢" },
      ],
    }),
    "peter-crash-building": {
      character: "peter",
      title: "Building",
      bg: BG.crash,
      stats: STATS_ZERO,
      text: "💥 Crash. The building belonged to Willie. Sorry, Willie.",
      choices: [{ label: "...", goto: "peter-game-over-crash-building" }],
    },
    "peter-crash-bob": {
      character: "peter",
      title: "Pedestrian",
      bg: BG.crash,
      stats: STATS_ZERO,
      text:
        "💥 Crash. The pedestrian was Bob. And then a lamp post. And then the " +
        "abyss.",
      choices: [{ label: "...", goto: "peter-game-over-crash-bob" }],
    },

    "peter-debug-menu": {
      character: "peter",
      title: "Debug menu",
      bg: BG.debug,
      stats: STATS_ZERO,
      text:
        "You phase into a DEBUG MENU. Glowing buttons hum: MAX_STATS, " +
        "DELETE_REALITY, ???",
      choices: [
        { label: "Press MAX_STATS", goto: "peter-max-stats" },
        { label: "Press DELETE_REALITY", goto: "peter-glitch" },
        { label: "Press ???", goto: "peter-clone-experiment" },
      ],
    },
    "peter-glitch": {
      character: "peter",
      title: "Reality deleted",
      bg: BG.gameOver,
      stats: STATS_ZERO,
      text:
        "You press DELETE_REALITY. Everything goes white. Then nothing. Then " +
        "less than nothing.",
      choices: [{ label: "...", goto: "peter-game-over-deleted" }],
    },
    "peter-max-stats": S({
      title: "Max stats",
      bg: BG.debug,
      stats: STATS_ZERO,
      text:
        'You hover over MAX_STATS. A prompt appears: "CONFIRM. Are you sure ' +
        'you earned this?"',
      choices: [
        { label: "Yes.", goto: "peter-max-confirmed" },
        { label: "...no.", goto: "peter-max-honest" },
      ],
    }),
    "peter-max-confirmed": S({
      title: "Confirmed",
      bg: BG.debug,
      stats: STATS_ZERO,
      text:
        "You press confirm anyway. Stats: 💯 💯 💯. You did not earn this. " +
        "But here we are.",
      choices: [{ label: "Reboot reality", goto: "peter-game-over-cheat" }],
    }),
    "peter-max-honest": S({
      title: "Honest",
      bg: BG.debug,
      stats: STATS_ZERO,
      text:
        "You walk away. The button hums approvingly. Stats unchanged. You " +
        "feel taller. Smarter. Earned.",
      choices: [{ label: "Ascend honestly", goto: "peter-walk-away" }],
    }),
    "peter-walk-away": S({
      title: "Walked away",
      bg: BG.depot,
      stats: STATS_INT,
      text:
        "You walk out of the debug menu. The bus brakes mysteriously work " +
        "again. You drive home, somehow wiser, somehow heavier. The fridge " +
        "is still glowing. So are you.",
      choices: [{ label: "...", goto: "peter-game-over-walk-away" }],
    }),

    "peter-clone-experiment": S({
      title: "Cloning chamber",
      bg: BG.debug,
      stats: STATS_ZERO,
      text: "You press the button and a copy of you appears.",
      choices: [
        { label: "Duplicate", goto: "peter-duplicate" },
        { label: "Fight the clone", goto: "peter-fight-clone" },
      ],
    }),
    "peter-duplicate": S({
      title: "Duplicate",
      bg: BG.debug,
      stats: STATS_ZERO,
      text:
        "You press the button again, and so does your copy. The two new " +
        "copies also press the button. The four new copies also press the " +
        "button. The eight new copies also press the button. None of them " +
        "are going to stop.",
      choices: [{ label: "Watch", goto: "peter-game-over-infinite" }],
    }),
    "peter-fight-clone": {
      character: "peter",
      title: "Fight the clone",
      bg: BG.debug,
      stats: STATS_ZERO,
      text:
        "You swing at the clone. The clone swings back. He is a better Peter " +
        "than you. You always knew.",
      choices: [{ label: "...", goto: "peter-game-over-clone" }],
    },

    "peter-doctor": S({
      title: "Doctor's office",
      bg: BG.doctor,
      stats: STATS_ZERO,
      text:
        'The doctor\'s office. Posters: "PLEASE DO NOT GLOW IN THIS BUILDING."',
      choices: [{ label: "Get a scan", goto: "peter-mri" }],
    }),
    "peter-mri": S({
      title: "MRI",
      bg: BG.glow,
      stats: STATS_ZERO,
      text:
        'The MRI lights up like Times Square. A poster reads: "Price ' +
        'guarantee — ALWAYS EXPENSIVE. © Elli\'s Medical Imaging." The doctor ' +
        "weeps with awe and mild concern.",
      choices: [{ label: "Continue", goto: "peter-treatment" }],
    }),
    "peter-treatment": S({
      title: "Treatment",
      bg: BG.doctor,
      stats: STATS_ZERO,
      text:
        'The doctor presents two options. "Anti-radiation injection. Or — ' +
        'for our premium clients — the GLOW PACKAGE. Keep the gift. Embrace ' +
        'the gift." He slides a brochure across the desk. It is warm.',
      choices: [
        { label: "Take the injection", goto: "peter-cured-fridge" },
        { label: "Take the Glow Package", goto: "peter-game-over-radiation-glow" },
      ],
    }),
    "peter-cured-fridge": S({
      title: "Quiet",
      bg: BG.inside,
      stats: STATS_INT_FIT,
      text:
        "Cured. You go home. The fridge is dark — you forgot you were " +
        "powering it yourself. The hum is gone. The silence is loud. You " +
        "decide you like it.",
      choices: [{ label: "Open the mail", goto: "peter-settlement" }],
    }),
    "peter-settlement": S({
      title: "Settlement",
      bg: BG.inside,
      stats: STATS_FULL,
      text:
        "A letter arrives. The depot's lawyers want to settle quietly for " +
        "the radiation incident. The check has more zeroes than your bus has " +
        "wheels.",
      choices: [{ label: "Live", goto: "peter-win-cured" }],
    }),

    "peter-win-cured": {
      character: "peter",
      title: "Cured",
      bg: BG.outside,
      text:
        "YOU WIN — CURED. You are a normal person now. Mostly. Sometimes you " +
        "still hum. The bills are paid. The fridge stays dark.",
      ending: "win",
      choices: [BACK_TO_MENU],
    },

    // ── Peter's game-overs ────────────────────────────────────────────
    "peter-game-over-indecisive": G(
      "Game Over: Indecisive",
      BG.gameOver,
      'GAME OVER. "Uhh what?" Really? You picked a character, looked at them, ' +
        "and froze. They are embarrassed for you. So am I. Try committing to " +
        "something. Anything."
    ),
    "peter-game-over-quiet": G(
      "Game Over: Door closed",
      BG.inside,
      "GAME OVER. You closed the door. You closed the next door. And the " +
        "next. The fridge hums on. Time, however, does not."
    ),
    "peter-game-over-555": G(
      "Game Over: Claimed",
      BG.cosmos,
      'GAME OVER. The ancient voice on 555-LIFE was patient. It has waited ' +
        'a long time. It is no longer waiting.'
    ),
    "peter-game-over-radiation-glow": G(
      "Game Over: Radioactive",
      BG.glow,
      "GAME OVER. You take the Glow Package. You glow eternally. Your " +
        "shadow continues to glow on the wall."
    ),
    "peter-game-over-radiation-meltdown": G(
      "Game Over: Meltdown",
      BG.glow,
      "GAME OVER. The red lever was a bad idea. The depot is a stain. So " +
        "are you."
    ),
    "peter-game-over-crash-building": G(
      "Game Over: Crash (building)",
      BG.crash,
      "GAME OVER. The bus made contact with reality. Reality lost. So did " +
        "Willie's building."
    ),
    "peter-game-over-crash-bob": G(
      "Game Over: Crash (Bob)",
      BG.crash,
      "GAME OVER. The bus made contact with Bob. Bob made contact with the " +
        "abyss. The lamp post was a witness."
    ),
    "peter-game-over-deleted": G(
      "Game Over: Reality deleted",
      BG.gameOver,
      "GAME OVER. There is no game. There is no over. There is nothing."
    ),
    "peter-game-over-cheat": G(
      "Game Over: Cheater",
      BG.debug,
      "GAME OVER. The Life Game does not tolerate cheaters. Stats reset to " +
        "💀 💀 💀. You are unmade."
    ),
    "peter-game-over-walk-away": G(
      "Game Over: Walked away",
      BG.depot,
      "GAME OVER. Honesty is its own reward. The reward, in this case, is " +
        "the depot, the fridge, the rent, and very little else."
    ),
    "peter-game-over-pillar": G(
      "Game Over: Pillar of light",
      BG.glow,
      "GAME OVER. You are a pillar of pure energy. Beautiful, broke, and " +
        "not technically alive."
    ),
    "peter-game-over-clone": G(
      "Game Over: Clone wins",
      BG.debug,
      "GAME OVER. You always knew, deep down, he was the better Peter."
    ),
    "peter-game-over-infinite": G(
      "Game Over: Infinite Peter",
      BG.debug,
      "GAME OVER. The exponentially multiplying Peters engulf the city, " +
        "the planet, and then the entire universe. Each one is just as " +
        "broke as the last."
    ),
  });
})();
