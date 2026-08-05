// Willie's scene tree.
//
//   willie-start  {1,0,0}
//   └── load → willie-outside-home  {1,0,0}
//       ├── "Go inside"   → willie-hit-by-bus → game-over-bus
//       ├── "Find a job"  → willie-job-hunt → interview-room → q1
//       │   ├── Tomatoes        → q2
//       │   │   ├── I love tomatoes        → willie-hired  {1,1,0} → promoted  {1,1,1} → WIN-TOMATO-CEO
//       │   │   ├── I have read about…     → willie-hired …
//       │   │   └── I just need money      → game-over-interview-money
//       │   ├── Honesty         → game-over-interview-honesty
//       │   └── Lots of things  → q2 …
//       ├── "Walk it off" → willie-park
//       │   ├── Sit on the bench → willie-bench → game-over-bench-bob
//       │   └── Jog to the gym   → willie-jog
//       │       ├── Push through     → willie-collapse → game-over-fitness
//       │       └── Wander toward …  → game-over-wandered
//       ├── 🍾 → willie-find-cheese
//       │   ├── Drink it (??)     → willie-drink-cheese → willie-magic-donkey  {1,1,1} → WIN-DONKEY
//       │   └── Read the label    → willie-cheese-label → game-over-stale-cheese
//       ├── 🍅 → willie-tomato-garden
//       │   ├── Pick one tomato   → willie-tomato-eat  {1,0,1}
//       │   │   ├── Eat another       → willie-tomato-fit → game-over-tomato-king
//       │   │   └── Save it for later → game-over-tomato-saved
//       │   └── Take them ALL     → willie-tomato-greedy
//       │       ├── Run     → willie-tomato-chase → game-over-tomato-chase
//       │       └── Fight   → willie-tomato-loss  → game-over-tomato-loss
//       └── Uhh what? → game-over-indecisive

(function () {
  const { BG, BACK_TO_MENU, loadingStep, registerScenes } = window;
  const PORTRAIT = "images/willie.png";

  const S = (overrides) => ({
    character: "willie",
    portrait: PORTRAIT,
    ...overrides,
  });
  const G = (title, bg, text) => ({
    character: "willie",
    title,
    bg,
    text,
    ending: "game-over",
    choices: [BACK_TO_MENU],
  });
  const STATS_BASE = { intelligence: 1, money: 0, fitness: 0 }; // willie's start
  const STATS_FIT = { intelligence: 1, money: 0, fitness: 1 };
  const STATS_INT_MONEY = { intelligence: 1, money: 1, fitness: 0 };
  const STATS_FULL = { intelligence: 1, money: 1, fitness: 1 };

  registerScenes({
    "willie-start": S({
      title: "Let's go!",
      bg: BG.outside,
      stats: STATS_BASE,
      text: "You are Willie. Smart, broke, soft. Let's go!",
      choices: [
        { label: "OK", goto: "willie-load-1" },
        { label: "Uhh what?", goto: "willie-game-over-indecisive" },
      ],
    }),
    "willie-load-1": loadingStep("willie", "willie-load-2"),
    "willie-load-2": loadingStep("willie", "willie-outside-home", { step: 2 }),

    "willie-outside-home": S({
      title: "Outside home",
      bg: BG.outside,
      stats: STATS_BASE,
      text:
        "Home, sweet home. Something glints in the bushes. Tomato leaves " +
        "rustle next door.",
      choices: [
        { label: "Go inside", goto: "willie-hit-by-bus" },
        { label: "Find a job", goto: "willie-job-hunt" },
        { label: "Walk it off", goto: "willie-park" },
      ],
      hotspots: [
        { x: 350, y: 470, w: 50, h: 70, goto: "willie-find-cheese", hint: "🍾" },
        { x: 60, y: 470, w: 80, h: 80, goto: "willie-tomato-garden", hint: "🍅" },
      ],
    }),

    "willie-hit-by-bus": {
      character: "willie",
      title: "Hit by bus",
      bg: BG.busCrash,
      stats: STATS_BASE,
      text: "🚌💥 The bus comes through the WALL? How? Why??",
      choices: [{ label: "...", goto: "willie-game-over-bus" }],
    },

    // ── Cheese / donkey path ───────────────────────────────────────
    "willie-find-cheese": S({
      title: "Cheese bottle",
      bg: BG.outside,
      stats: STATS_BASE,
      text:
        "A bottle of SWEDISH CLEAR LIQUID CHEESE. Distilled thrice. Label: " +
        "one wink.",
      choices: [
        { label: "Drink it (??)", goto: "willie-drink-cheese" },
        { label: "Read the label", goto: "willie-cheese-label" },
      ],
    }),
    "willie-cheese-label": S({
      title: "Cheese label",
      bg: BG.outside,
      stats: STATS_BASE,
      text:
        "Ingredients: cheese, water, regret. Made in Stockholm. Best before: 1987.",
      choices: [{ label: "Drink anyway", goto: "willie-game-over-stale-cheese" }],
    }),
    "willie-drink-cheese": S({
      title: "Drink cheese",
      bg: BG.outside,
      stats: STATS_BASE,
      text: "You gulp the cheese. The sky tilts. A donkey appears.",
      choices: [{ label: "Greet the donkey", goto: "willie-magic-donkey" }],
    }),
    "willie-magic-donkey": S({
      title: "Magic donkey",
      bg: BG.outside,
      stats: STATS_FULL,
      text: "A MAGICAL MAGNETIZED DONKEY 🫏 makes you rich and ripped. Don't ask.",
      choices: [{ label: "Live forever", goto: "willie-win-donkey" }],
    }),
    "willie-win-donkey": {
      character: "willie",
      title: "Magnetized",
      bg: BG.outside,
      text:
        "YOU WIN — MAGNETIZED. The donkey was real. You are rich AND ripped. " +
        "Do not ask. The donkey will not tell you.",
      ending: "win",
      choices: [BACK_TO_MENU],
    },

    // ── Tomato garden path ─────────────────────────────────────────
    "willie-tomato-garden": S({
      title: "Tomato garden",
      bg: BG.garden,
      stats: STATS_BASE,
      text: "A magnificent tomato garden. Plump red orbs await your decisions.",
      choices: [
        { label: "Pick one tomato", goto: "willie-tomato-eat" },
        { label: "Take them ALL", goto: "willie-tomato-greedy" },
      ],
    }),
    "willie-tomato-eat": S({
      title: "Eat tomato",
      bg: BG.garden,
      stats: STATS_FIT,
      text: "The tomato is perfect. Fitness +5. Wisdom +1. You feel ripe.",
      choices: [
        { label: "Eat another", goto: "willie-tomato-fit" },
        { label: "Save it for later", goto: "willie-game-over-tomato-saved" },
      ],
    }),
    "willie-tomato-fit": S({
      title: "Tomato powers",
      bg: BG.garden,
      stats: STATS_FIT,
      text: "You are tomato now. The tomatoes accept you as their king.",
      choices: [{ label: "Accept your crown", goto: "willie-game-over-tomato-king" }],
    }),
    "willie-tomato-greedy": S({
      title: "Greedy",
      bg: BG.garden,
      stats: STATS_BASE,
      text:
        "47 tomatoes. The garden's owner manifests. He is large. He is " +
        "angry. He is the Tomato Man.",
      choices: [
        { label: "Run", goto: "willie-tomato-chase" },
        { label: "Fight him", goto: "willie-tomato-loss" },
      ],
    }),
    "willie-tomato-chase": S({
      title: "Chased",
      bg: BG.garden,
      stats: STATS_BASE,
      text:
        "You run. The Tomato Man is faster. The Tomato Man is always faster.",
      choices: [{ label: "Surrender", goto: "willie-game-over-tomato-chase" }],
    }),
    "willie-tomato-loss": {
      character: "willie",
      title: "Tomato loss",
      bg: BG.garden,
      stats: STATS_BASE,
      text:
        "You take a swing. The Tomato Man catches your fist in his fist. " +
        "Squelch.",
      choices: [{ label: "...", goto: "willie-game-over-tomato-loss" }],
    },

    // ── Park / gym path ────────────────────────────────────────────
    "willie-park": S({
      title: "Park",
      bg: BG.park,
      stats: STATS_BASE,
      text:
        "The park. Pigeons. A jogger blurs past. A bench in the corner has " +
        "a deeply familiar shape.",
      choices: [
        { label: "Sit on the bench", goto: "willie-bench" },
        { label: "Jog to the gym", goto: "willie-jog" },
      ],
    }),
    "willie-bench": S({
      title: "Bench (Bob)",
      bg: BG.park,
      stats: STATS_BASE,
      text:
        "You sit. The bench has Bob's face. The face smiles, faintly, from " +
        "somewhere in the wood. You stand up at a polite speed.",
      choices: [{ label: "Flee", goto: "willie-game-over-bench-bob" }],
    }),
    "willie-jog": S({
      title: "Jogging",
      bg: BG.gym,
      stats: STATS_BASE,
      text:
        "You jog three steps. Your lungs file a formal complaint. Your knees " +
        "second the motion.",
      choices: [
        { label: "Push through", goto: "willie-collapse" },
        { label: "Wander toward the tomatoes", goto: "willie-game-over-wandered" },
      ],
    }),
    "willie-collapse": {
      character: "willie",
      title: "Collapsed",
      bg: BG.gym,
      stats: STATS_BASE,
      text:
        "You collapse on a treadmill. The treadmill keeps moving. You exit " +
        "the gym at 12 km/h, backwards.",
      choices: [{ label: "...", goto: "willie-game-over-fitness" }],
    },

    // ── Job / Tomato CEO path ──────────────────────────────────────
    "willie-job-hunt": S({
      title: "Job hunt",
      bg: BG.street,
      stats: STATS_BASE,
      text:
        'You walk into town. A neon sign reads: "NOW HIRING — TOMATO EXPERTS".',
      choices: [{ label: "Enter", goto: "willie-interview-room" }],
    }),
    "willie-interview-room": S({
      title: "Interview",
      bg: BG.insideWork,
      stats: STATS_BASE,
      text:
        "An interview. The interviewer wears a tomato-print tie. He is very " +
        'serious about it. A framed photo on his desk reads: "Me & my brother ' +
        '(Tomato Man)."',
      choices: [{ label: "Begin", goto: "willie-q1" }],
    }),
    "willie-q1": S({
      title: "Question 1",
      bg: BG.insideWork,
      stats: STATS_BASE,
      text: '"What is your greatest weakness?"',
      choices: [
        { label: "Tomatoes", goto: "willie-q2" },
        { label: "Honesty", goto: "willie-game-over-interview-honesty" },
        { label: "Lots of things", goto: "willie-q2" },
      ],
    }),
    "willie-q2": S({
      title: "Question 2",
      bg: BG.insideWork,
      stats: STATS_BASE,
      text: '"Why should we hire you?"',
      choices: [
        { label: "I love tomatoes", goto: "willie-hired" },
        { label: "I have read about tomatoes", goto: "willie-hired" },
        { label: "I just need money", goto: "willie-game-over-interview-money" },
      ],
    }),
    "willie-hired": S({
      title: "Hired",
      bg: BG.insideWork,
      stats: STATS_INT_MONEY,
      text: "Hired! Money +9999. You are now Junior Tomato Expert.",
      choices: [{ label: "Continue", goto: "willie-promoted" }],
    }),
    "willie-promoted": S({
      title: "Promoted",
      bg: BG.insideWork,
      stats: STATS_FULL,
      text:
        "Promoted in four minutes. Senior. Then VP. Then CEO. Then literally " +
        "a tomato.",
      choices: [{ label: "Accept tomato-hood", goto: "willie-win-tomato-ceo" }],
    }),
    "willie-win-tomato-ceo": {
      character: "willie",
      title: "Tomato CEO",
      bg: BG.garden,
      text:
        "YOU WIN — TOMATO CEO. You ripen quarterly. The shareholders are " +
        "thrilled. You are, finally and completely, a tomato.",
      ending: "win",
      choices: [BACK_TO_MENU],
    },

    // ── Willie's game-overs ────────────────────────────────────────
    "willie-game-over-indecisive": G(
      "Game Over: Indecisive",
      BG.gameOver,
      'GAME OVER. "Uhh what?" Really? You picked a character, looked at ' +
        "them, and froze. They are embarrassed for you. So am I. Try " +
        "committing to something. Anything."
    ),
    "willie-game-over-bus": G(
      "Game Over: Bus",
      BG.busCrash,
      "GAME OVER. The bus wins. The bus always wins."
    ),
    "willie-game-over-tomato-chase": G(
      "Game Over: Tomato Man (chased)",
      BG.garden,
      "GAME OVER. The Tomato Man always wins. He's been gardening longer " +
        "than you've been alive."
    ),
    "willie-game-over-tomato-loss": G(
      "Game Over: Tomato Man (fight)",
      BG.garden,
      "GAME OVER. The Tomato Man always wins. Your fist still smells of " +
        "marinara."
    ),
    "willie-game-over-fitness": G(
      "Game Over: Fitness",
      BG.gym,
      "GAME OVER. You discover your lungs the hard way. You should've stuck " +
        "to tomatoes."
    ),
    "willie-game-over-tomato-saved": G(
      "Game Over: Saved for later",
      BG.garden,
      "GAME OVER. You saved the tomato for later. Later never came. The " +
        "tomato outlived you, briefly."
    ),
    "willie-game-over-tomato-king": G(
      "Game Over: Tomato King",
      BG.garden,
      "GAME OVER. You are crowned king of tomatoes — broke, frail, but " +
        "vegetatively royal. A life this incomplete is just sitting in a " +
        "garden."
    ),
    "willie-game-over-interview-honesty": G(
      "Game Over: Honesty",
      BG.insideWork,
      'GAME OVER. "Honesty" is not a weakness the Tomato Industry recognizes. ' +
        "The interviewer politely escorts you out the seventh-floor window."
    ),
    "willie-game-over-interview-money": G(
      "Game Over: Just needs money",
      BG.insideWork,
      "GAME OVER. The interviewer tosses you out the window. A bus is " +
        "approaching."
    ),
    "willie-game-over-bench-bob": G(
      "Game Over: Bench (Bob)",
      BG.park,
      "GAME OVER. You ran from a Bob-faced bench. You did not stop running. " +
        "You are now technically a jogger, but only in the way Willie is " +
        "technically a jogger."
    ),
    "willie-game-over-wandered": G(
      "Game Over: Wandered off",
      BG.garden,
      "GAME OVER. You wandered toward the tomatoes. You forgot the gym. " +
        "You forgot the job. You forgot lunch. You will be missed by no one."
    ),
    "willie-game-over-stale-cheese": G(
      "Game Over: Stale cheese",
      BG.outside,
      'GAME OVER. You read "1987" on the label. You drank anyway. The cheese ' +
        "was not the friend you wanted it to be."
    ),
  });
})();
