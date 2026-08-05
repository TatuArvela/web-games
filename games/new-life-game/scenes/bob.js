// Bob's scene tree.
//
//   bob-start  {0,1,1}
//   └── load → bob-outside-home  {0,1,1}
//       ├── "Go inside" → bob-inside-home → load → bob-outside-work  {0,1,1}
//       │   ├── "Go inside" → bob-inside-work → bob-work-done → bob-fired
//       │   │   ├── "Steal something" → bob-steal
//       │   │   │   ├── Brain Manual → find-book → read-book → page-327 → get-smart  {1,1,1} → WIN
//       │   │   │   ├── Stapler      → take-stapler → stapler-home → game-over-stapler-bus
//       │   │   │   └── USB stick    → take-usb → bob-usb-debug
//       │   │   │       ├── SMART      → game-over-debug-smart
//       │   │   │       ├── RICH       → game-over-debug-rich
//       │   │   │       └── DELETE_BOB → game-over-deleted
//       │   │   ├── "Drown your sorrows" → bob-bar
//       │   │   │   ├── Order a drink → bob-drinks  {0,0,1}
//       │   │   │   │   ├── One more     → bar-fight  {0,0,1} → game-over-bar-fight
//       │   │   │   │   └── Stumble home → drunk-home {0,0,1} → game-over-drunk-bus
//       │   │   │   ├── Tip the bartender → bob-bartender → game-over-bartender
//       │   │   │   ├── Use the jukebox   → bob-jukebox   → game-over-jukebox
//       │   │   │   └── Talk to the bouncer → bob-talk-bouncer
//       │   │   │       ├── Insult        → game-over-bar-bouncer
//       │   │   │       └── Back away     → game-over-coward
//       │   │   └── "Leave with dignity" → bob-leave → bob-back-to-town
//       │   │       ├── "Continue"   → load → bob-hit-by-bus → game-over-bus
//       │   │       └── 🧱           → bob-brick-wall → game-over-brick
//       │   └── 📋 ad space → bob-ad-space → game-over-ad
//       ├── 💐 → bob-flower-shop
//       │   ├── Buy a tulip → bob-flower-broke → game-over-broke-flowers
//       │   ├── Just browse → bob-flower-thrown-out → game-over-thrown
//       │   └── Leave      → game-over-flower-shop
//       ├── "Go to the park" → bob-park
//       │   ├── Sit on the bench → bob-park-bench → bench-2
//       │   │   ├── Stand up    → bench-stand-2 → game-over-stand-up
//       │   │   └── Keep sitting → bench-3
//       │   │       ├── Try to stand → bench-stand-3 → park-asleep → game-over-broke
//       │   │       └── Keep sitting → bench-final → game-over-bench
//       │   ├── 🍄 glow → bob-shroom-eat → trip-1 → trip-2 → enlightenment  {1,1,1} → WIN-ENLIGHTENED
//       │   └── 🍄 bad  → bob-bad-shroom → game-over-shroom
//       └── "Go to the gym" → bob-gym
//           ├── Push-ups → bob-gym-pushups → game-over-pushups
//           └── Deadlift → bob-gym-deadlift
//               ├── Lift it           → gym-buff → gym-smart  {1,1,1} → WIN-FIT-GOD
//               └── Add more weight   → gym-failed → game-over-crushed

(function () {
  const { BG, BACK_TO_MENU, loadingStep, registerScenes } = window;
  const PORTRAIT = "images/bob.png";

  const S = (overrides) => ({
    character: "bob",
    portrait: PORTRAIT,
    ...overrides,
  });
  const G = (title, bg, text) => ({
    character: "bob",
    title,
    bg,
    text,
    ending: "game-over",
    choices: [BACK_TO_MENU],
  });
  const STATS_BASE = { intelligence: 0, money: 1, fitness: 1 }; // Bob's start
  const STATS_DRUNK = { intelligence: 0, money: 0, fitness: 1 };
  const STATS_FULL = { intelligence: 1, money: 1, fitness: 1 };

  registerScenes({
    "bob-start": S({
      title: "Let's go!",
      bg: BG.outside,
      stats: STATS_BASE,
      text: "You are Bob. You feel strong but a bit dim. Let's go!",
      choices: [
        { label: "OK", goto: "bob-load-1" },
        { label: "Uhh what?", goto: "bob-game-over-indecisive" },
      ],
    }),
    "bob-load-1": loadingStep("bob", "bob-load-2"),
    "bob-load-2": loadingStep("bob", "bob-outside-home", { step: 2 }),

    "bob-outside-home": S({
      title: "Outside home",
      bg: BG.outside,
      stats: STATS_BASE,
      text: "You stand outside your home. The mushrooms wave at you.",
      choices: [
        { label: "Go inside", goto: "bob-inside-home" },
        { label: "Go to the park", goto: "bob-park" },
        { label: "Go to the gym", goto: "bob-gym" },
      ],
      hotspots: [
        { x: 60, y: 360, w: 70, h: 70, goto: "bob-flower-shop", hint: "💐" },
      ],
    }),

    // ── Work path ─────────────────────────────────────────────────
    "bob-inside-home": S({
      title: "Inside home",
      bg: BG.inside,
      stats: STATS_BASE,
      text:
        "Inside. Your fridge has one egg and a sticky note: \"EAT ME AFTER " +
        "WORK\". Bold of past Bob. Suddenly you remember you should be at work.",
      choices: [{ label: "Go to work", goto: "bob-load-3" }],
    }),
    "bob-load-3": loadingStep("bob", "bob-load-4"),
    "bob-load-4": loadingStep("bob", "bob-outside-work", { step: 2 }),
    "bob-outside-work": S({
      title: "Outside work",
      bg: BG.outsideWork,
      stats: STATS_BASE,
      text: "The office. It hums quietly. Ominously.",
      choices: [{ label: "Go inside", goto: "bob-inside-work" }],
      hotspots: [
        { x: 920, y: 80, w: 130, h: 70, goto: "bob-ad-space", hint: "📋" },
      ],
    }),
    "bob-inside-work": S({
      title: "Inside work",
      bg: BG.insideWork,
      stats: STATS_BASE,
      text:
        "The boss slams a stack of folders on your desk. \"Bob. Sort these. " +
        "By smell. You've got fifteen minutes. And do something about that " +
        "haircut.\"",
      choices: [
        { label: "Sort by smell", goto: "bob-work-done" },
        { label: "Sort by color instead", goto: "bob-work-done" },
        { label: "Eat one folder", goto: "bob-work-done" },
      ],
    }),
    "bob-work-done": S({
      title: "Performance review",
      bg: BG.insideWork,
      stats: STATS_BASE,
      text:
        "The boss returns. You got paid +500! ...you also got fired. Boss " +
        "says it's the haircut.",
      choices: [{ label: "Continue", goto: "bob-fired" }],
    }),
    "bob-fired": S({
      title: "Fired",
      bg: BG.insideWork,
      stats: STATS_BASE,
      text: "You're alone in the office. What do you do?",
      choices: [
        { label: "Steal something", goto: "bob-steal" },
        { label: "Drown your sorrows", goto: "bob-bar" },
        { label: "Leave with dignity", goto: "bob-leave" },
      ],
    }),

    // ── Steal sub-branch ──────────────────────────────────────────
    "bob-steal": S({
      title: "Steal",
      bg: BG.insideWork,
      stats: STATS_BASE,
      text:
        "You rummage through the boss's drawer. Three things look interesting.",
      choices: [
        { label: 'A book: "Brain Manual"', goto: "bob-find-book" },
        { label: "The boss's stapler", goto: "bob-take-stapler" },
        { label: "A USB stick labelled DO_NOT", goto: "bob-take-usb" },
      ],
    }),
    "bob-find-book": S({
      title: "Page 1",
      bg: BG.inside,
      stats: STATS_BASE,
      text:
        'Home. You open the Brain Manual. Page 1: "Think." You try. Something ' +
        "flickers, deep down.",
      choices: [{ label: "Page 2", goto: "bob-read-book" }],
    }),
    "bob-read-book": S({
      title: "Page 2",
      bg: BG.inside,
      stats: STATS_BASE,
      text:
        'Page 2: "Think harder." You think harder. Steam rises off your head. ' +
        "The mushrooms outside applaud.",
      choices: [{ label: "Skip ahead", goto: "bob-page-327" }],
    }),
    "bob-page-327": S({
      title: "Page 327",
      bg: BG.inside,
      stats: STATS_BASE,
      text: "Page 327: a mirror. You stare. The mirror stares. You both know.",
      choices: [{ label: "Close the book", goto: "bob-get-smart" }],
    }),
    "bob-get-smart": S({
      title: "Smart now",
      bg: BG.inside,
      stats: STATS_FULL,
      text:
        "You get smart. The boss was right about the haircut. The haircut was " +
        "a metaphor. You finally see it.",
      choices: [{ label: "Live your best life", goto: "bob-win" }],
    }),
    "bob-win": {
      character: "bob",
      title: "You Win",
      bg: BG.win,
      text: "YOU WIN! A life well lived.",
      ending: "win",
      choices: [BACK_TO_MENU],
    },

    "bob-take-stapler": S({
      title: "Stapler",
      bg: BG.outside,
      stats: STATS_BASE,
      text:
        "You pocket the boss's stapler. Ergonomic. Weighty. Yours now. You " +
        "feel deeply armed.",
      choices: [{ label: "Go home", goto: "bob-stapler-home" }],
    }),
    "bob-stapler-home": S({
      title: "Stapler defense",
      bg: BG.inside,
      stats: STATS_BASE,
      text:
        "Home. You arrange the stapler on the coffee table, just so. A bus " +
        "drives through the living room wall. You staple it twice before " +
        "going down.",
      choices: [{ label: "...", goto: "bob-game-over-stapler-bus" }],
    }),

    "bob-take-usb": S({
      title: "USB stick",
      bg: BG.insideWork,
      stats: STATS_BASE,
      text:
        "DO_NOT, the label says. You plug it into the boss's computer. The " +
        "screen flashes green.",
      choices: [{ label: "Continue", goto: "bob-usb-debug" }],
    }),
    "bob-usb-debug": S({
      title: "Office debug menu",
      bg: BG.debug,
      stats: STATS_BASE,
      text:
        "A debug menu fills the screen. Glowing buttons hum: SMART, RICH, " +
        "DELETE_BOB. Somewhere far away, a bald man feels jealous.",
      choices: [
        { label: "Press SMART", goto: "bob-game-over-debug-smart" },
        { label: "Press RICH", goto: "bob-game-over-debug-rich" },
        { label: "Press DELETE_BOB", goto: "bob-game-over-deleted" },
      ],
    }),

    // ── Bar sub-branch ────────────────────────────────────────────
    "bob-bar": S({
      title: "Bar",
      bg: BG.bar,
      stats: STATS_BASE,
      text:
        "A dive bar. The bartender nods at you sympathetically. Or " +
        "threateningly. Hard to tell.",
      choices: [
        { label: "Order a drink", goto: "bob-drinks" },
        { label: "Tip the bartender", goto: "bob-bartender" },
        { label: "Use the jukebox", goto: "bob-jukebox" },
        { label: "Talk to the bouncer", goto: "bob-talk-bouncer" },
      ],
    }),
    "bob-drinks": S({
      title: "Drinks",
      bg: BG.bar,
      stats: STATS_DRUNK,
      text:
        "Three drinks in. The room tilts. Money: -200. Wisdom: -10. Friends: +0.",
      choices: [
        { label: "One more", goto: "bob-bar-fight" },
        { label: "Stumble home", goto: "bob-drunk-home" },
      ],
    }),
    "bob-bar-fight": {
      character: "bob",
      title: "Bar fight",
      bg: BG.bar,
      stats: STATS_DRUNK,
      text:
        "You insult a stranger. He turns out to be the bouncer. He turns out " +
        "to be very strong. He turns out to be the Tomato Man's cousin. Of " +
        "course.",
      choices: [{ label: "...", goto: "bob-game-over-bar-fight" }],
    },
    "bob-drunk-home": S({
      title: "Stumbling home",
      bg: BG.street,
      stats: STATS_DRUNK,
      text: "You stagger toward home. A bus appears. The bus also notices you.",
      choices: [{ label: "...", goto: "bob-game-over-drunk-bus" }],
    }),
    "bob-bartender": S({
      title: "Bartender",
      bg: BG.bar,
      stats: STATS_BASE,
      text:
        "He pockets the tip and leans in. \"You're being watched, you know. " +
        "The Life Game. Always have been. Three of you, even.\" He winks. " +
        "You decide you need to lie down forever.",
      choices: [{ label: "...", goto: "bob-game-over-bartender" }],
    }),
    "bob-jukebox": S({
      title: "Jukebox",
      bg: BG.bar,
      stats: STATS_BASE,
      text:
        'Track A1: "My Wife Left Me (And Took the Bus)." Track A2: "My Wife ' +
        'Left Me (Reprise)." You play A1 three times. The whole bar joins in ' +
        "by the third. You sit down and never get back up.",
      choices: [{ label: "...", goto: "bob-game-over-jukebox" }],
    }),
    "bob-talk-bouncer": S({
      title: "Bouncer",
      bg: BG.bar,
      stats: STATS_BASE,
      text:
        "The bouncer is the size of a small horse. He nods. He has not " +
        "spoken in eleven years. The silence is doing most of the talking.",
      choices: [
        { label: "Insult him anyway", goto: "bob-game-over-bar-bouncer" },
        { label: "Back away slowly", goto: "bob-game-over-coward" },
      ],
    }),

    // ── Leave-with-dignity sub-branch ─────────────────────────────
    "bob-leave": S({
      title: "Leave",
      bg: BG.outsideWork,
      stats: STATS_BASE,
      text: "You leave with your head held high. And empty.",
      choices: [{ label: "Go home", goto: "bob-back-to-town" }],
    }),
    "bob-back-to-town": S({
      title: "Back to town",
      bg: BG.street,
      stats: STATS_BASE,
      text:
        "You walk home, thinking about lunch. Lunch doesn't think about you " +
        "at all.",
      choices: [{ label: "Continue", goto: "bob-load-5" }],
      hotspots: [
        { x: 70, y: 280, w: 80, h: 120, goto: "bob-brick-wall", hint: "🧱" },
      ],
    }),
    "bob-load-5": loadingStep("bob", "bob-load-6"),
    "bob-load-6": loadingStep("bob", "bob-hit-by-bus", { step: 2 }),
    "bob-hit-by-bus": {
      character: "bob",
      title: "Hit by bus",
      bg: BG.busCrash,
      stats: STATS_BASE,
      text: "🚌💥 A bus driven by a strange bald man hits you head-on.",
      choices: [{ label: "...", goto: "bob-game-over-bus" }],
    },
    "bob-brick-wall": S({
      title: "Brick wall",
      bg: BG.brickWall,
      stats: STATS_BASE,
      text:
        "It's a brick wall. You stare. The brick wall does not stare back. " +
        "This was a dead end.",
      choices: [{ label: "...", goto: "bob-game-over-brick" }],
    }),

    // ── Ad space hotspot terminal ─────────────────────────────────
    "bob-ad-space": S({
      title: "Ad space for sale",
      bg: BG.adSpace,
      stats: STATS_BASE,
      text:
        'A weathered billboard: "ADVERTISING SPACE FOR SALE. Call 555-LIFE." ' +
        "You memorize the number. Just in case. You never make the call. The " +
        "office never sees you again.",
      choices: [{ label: "...", goto: "bob-game-over-ad" }],
    }),

    // ── Flower-shop side-quest ────────────────────────────────────
    "bob-flower-shop": S({
      title: "Elli's Flower Shop",
      bg: BG.flowerShop,
      stats: STATS_BASE,
      text:
        'ELLI\'S FLOWER SHOP. The sign reads: "Price guarantee — ALWAYS ' +
        'EXPENSIVE."',
      choices: [
        { label: "Buy a tulip (€200)", goto: "bob-flower-broke" },
        { label: "Just browse", goto: "bob-flower-thrown-out" },
        { label: "Leave", goto: "bob-game-over-flower-shop" },
      ],
    }),
    "bob-flower-broke": S({
      title: "€200 tulip",
      bg: BG.tulipRoom,
      stats: STATS_BASE,
      text:
        "€200 for one tulip. You accept because Elli is staring at you and " +
        "you are weak. You go home holding a tulip and not much else.",
      choices: [{ label: "...", goto: "bob-game-over-broke-flowers" }],
    }),
    "bob-flower-thrown-out": S({
      title: "Thrown out",
      bg: BG.flowerShop,
      stats: STATS_BASE,
      text:
        'Elli throws you out. "Browsing is not free. Nothing is free." The ' +
        "door slams. You sit on the curb. The day passes.",
      choices: [{ label: "...", goto: "bob-game-over-thrown" }],
    }),

    // ── Park / mushrooms ──────────────────────────────────────────
    "bob-park": S({
      title: "Park",
      bg: BG.park,
      stats: STATS_BASE,
      text:
        "The park. Birds. Pigeons. Two suspiciously similar mushrooms in the " +
        "grass.",
      choices: [{ label: "Sit on the bench", goto: "bob-park-bench" }],
      overlays: [
        { image: "images/props/mushroom-glow.png", x: 720, y: 420, w: 50, h: 50 },
        { image: "images/props/mushroom-bad.png", x: 220, y: 460, w: 50, h: 50 },
      ],
      hotspots: [
        { x: 720, y: 420, w: 50, h: 50, goto: "bob-shroom-eat", hint: "🍄" },
        { x: 220, y: 460, w: 50, h: 50, goto: "bob-bad-shroom", hint: "🍄" },
      ],
    }),
    "bob-bad-shroom": {
      character: "bob",
      title: "Bad mushroom",
      bg: BG.trip,
      stats: STATS_BASE,
      text:
        "You eat the OTHER mushroom. Wrong. Wrong wrong wrong. The colors are " +
        "wrong.",
      choices: [{ label: "...", goto: "bob-game-over-shroom" }],
    },
    "bob-park-bench": S({
      title: "On the bench",
      bg: BG.park,
      stats: STATS_BASE,
      text:
        "You sit. Nothing happens. You sit some more. A pigeon judges you.",
      choices: [{ label: "Keep sitting", goto: "bob-park-bench-2" }],
    }),
    "bob-park-bench-2": S({
      title: "Still on the bench",
      bg: BG.park,
      stats: STATS_BASE,
      text:
        "Time passes. The pigeon has been joined by a parliament. They are " +
        "voting on you.",
      choices: [
        { label: "Stand up", goto: "bob-park-bench-stand-2" },
        { label: "Keep sitting", goto: "bob-park-bench-3" },
      ],
    }),
    "bob-park-bench-stand-2": S({
      title: "Stand up?",
      bg: BG.park,
      stats: STATS_BASE,
      text:
        "You stand! Briefly. The bench groans. Your knees groan louder. You " +
        "sit back down. The pigeons applaud, sarcastically.",
      choices: [{ label: "...", goto: "bob-game-over-stand-up" }],
    }),
    "bob-park-bench-3": S({
      title: "Bench-shaped",
      bg: BG.park,
      stats: STATS_BASE,
      text:
        "You are now 40% bench. The bench is 60% you. The math is concerning.",
      choices: [
        { label: "Try to stand", goto: "bob-park-bench-stand-3" },
        { label: "Keep sitting", goto: "bob-park-bench-final" },
      ],
    }),
    "bob-park-bench-stand-3": S({
      title: "Can't stand",
      bg: BG.park,
      stats: STATS_BASE,
      text:
        "You half-stand, half-doze. The raccoons converge. You barely notice.",
      choices: [{ label: "Drift off", goto: "bob-park-asleep" }],
    }),
    "bob-park-bench-final": {
      character: "bob",
      title: "IS the bench",
      bg: BG.park,
      stats: STATS_BASE,
      text:
        "You are the bench. The park has acquired a Bob-shaped bench. The " +
        "pigeons sit on you.",
      choices: [{ label: "...", goto: "bob-game-over-bench" }],
    },
    "bob-park-asleep": {
      character: "bob",
      title: "Asleep",
      bg: BG.park,
      stats: STATS_BASE,
      text:
        "You fall asleep. A raccoon takes your wallet. It will need it more " +
        "than you.",
      choices: [{ label: "...", goto: "bob-game-over-broke" }],
    },
    "bob-shroom-eat": S({
      title: "Eat the mushroom",
      bg: BG.park,
      stats: STATS_BASE,
      text:
        "You eat the glowing mushroom. It tastes like ozone and licorice.",
      choices: [{ label: "Continue", goto: "bob-trip-1" }],
    }),
    "bob-trip-1": S({
      title: "Tripping",
      bg: BG.trip,
      stats: STATS_BASE,
      text: "COLORS. So many colors. Your hands are made of bees.",
      choices: [{ label: "Continue", goto: "bob-trip-2" }],
    }),
    "bob-trip-2": S({
      title: "Deep trip",
      bg: BG.cosmos,
      stats: STATS_BASE,
      text:
        "You float past Saturn. Saturn nods like it knows. You forget to ask " +
        "anything.",
      choices: [{ label: "Continue", goto: "bob-enlightenment" }],
    }),
    "bob-enlightenment": S({
      title: "Enlightened",
      bg: BG.cosmos,
      stats: STATS_FULL,
      text:
        "Bob is smart now. He thinks two thoughts in a row. He's never done " +
        "that before.",
      choices: [{ label: "Embrace it", goto: "bob-win-enlightened" }],
    }),
    "bob-win-enlightened": {
      character: "bob",
      title: "Enlightened",
      bg: BG.cosmos,
      text:
        "YOU WIN — ENLIGHTENED. You are infinitely smart, fit, and probably " +
        "haunted.",
      ending: "win",
      choices: [BACK_TO_MENU],
    },

    // ── Gym path ──────────────────────────────────────────────────
    "bob-gym": S({
      title: "Gym",
      bg: BG.gym,
      stats: STATS_BASE,
      text:
        "The gym. Mirrors everywhere. A protein cloud hangs over the " +
        "treadmills.",
      choices: [
        { label: "Push-ups", goto: "bob-gym-pushups" },
        { label: "Deadlift", goto: "bob-gym-deadlift" },
      ],
    }),
    "bob-gym-pushups": S({
      title: "Push-ups",
      bg: BG.gym,
      stats: STATS_BASE,
      text:
        "1… 2… 200. The treadmill respects you now. But pushups alone do not " +
        "a life make. You go home, pumped and still uneducated.",
      choices: [{ label: "...", goto: "bob-game-over-pushups" }],
    }),
    "bob-gym-deadlift": S({
      title: "Deadlift",
      bg: BG.gym,
      stats: STATS_BASE,
      text:
        "The deadlift bar. 400 kg already on it. The plates whisper at you.",
      choices: [
        { label: "Lift it", goto: "bob-gym-buff" },
        { label: "Add more weight", goto: "bob-gym-failed" },
      ],
    }),
    "bob-gym-failed": {
      character: "bob",
      title: "Lifting accident",
      bg: BG.gym,
      stats: STATS_BASE,
      text:
        "You load 700 kg. You attempt the lift. You become one with the floor.",
      choices: [{ label: "...", goto: "bob-game-over-crushed" }],
    },
    "bob-gym-buff": S({
      title: "Buff",
      bg: BG.gym,
      stats: STATS_BASE,
      text:
        'You lift like a god. In the locker room you find a small book: ' +
        '"Lifting Philosophy".',
      choices: [{ label: "Read it", goto: "bob-gym-smart" }],
    }),
    "bob-gym-smart": S({
      title: "Smart and buff",
      bg: BG.gym,
      stats: STATS_FULL,
      text:
        "You speed-read Kant in four minutes. Intelligence: MAX. Triple " +
        "threat unlocked.",
      choices: [{ label: "Ascend", goto: "bob-win-fit-god" }],
    }),
    "bob-win-fit-god": {
      character: "bob",
      title: "Fitness God",
      bg: BG.gym,
      text:
        "YOU WIN — FITNESS GOD. You teach calculus while bench-pressing buses.",
      ending: "win",
      choices: [BACK_TO_MENU],
    },

    // ── Bob's game-overs ──────────────────────────────────────────
    "bob-game-over-indecisive": G(
      "Game Over: Indecisive",
      BG.gameOver,
      'GAME OVER. "Uhh what?" Really? You picked a character, looked at ' +
        "them, and froze. They are embarrassed for you. So am I. Try " +
        "committing to something. Anything."
    ),
    "bob-game-over-stapler-bus": G(
      "Game Over: Stapler vs bus",
      BG.busCrash,
      "GAME OVER. The bus wins. The stapler tried its best."
    ),
    "bob-game-over-debug-smart": G(
      "Game Over: Fake SMART",
      BG.debug,
      "GAME OVER. The SMART button was fake. The debug menu was a phishing " +
        "site. Your wallet is empty and someone in Belarus is at the gym."
    ),
    "bob-game-over-debug-rich": G(
      "Game Over: Fake RICH",
      BG.debug,
      "GAME OVER. The RICH button was fake. Same scam. Different button. " +
        "Your wallet is now in Belarus. Possibly the gym."
    ),
    "bob-game-over-deleted": G(
      "Game Over: Reality deleted",
      BG.gameOver,
      "GAME OVER. There is no game. There is no over. There is nothing."
    ),
    "bob-game-over-bar-fight": G(
      "Game Over: Bar fight",
      BG.bar,
      "GAME OVER. The bouncer wins. He always does. He is the size of a " +
        "small horse."
    ),
    "bob-game-over-drunk-bus": G(
      "Game Over: Drunk vs bus",
      BG.busCrash,
      "GAME OVER. The bus wins. The bus always wins. Especially when you " +
        "stagger into it."
    ),
    "bob-game-over-bartender": G(
      "Game Over: Bartender knows",
      BG.bar,
      "GAME OVER. You stayed too long. The bartender's secrets infected " +
        "you. You stopped getting up."
    ),
    "bob-game-over-jukebox": G(
      "Game Over: Jukebox forever",
      BG.bar,
      'GAME OVER. You played "My Wife Left Me (And Took the Bus)" until ' +
        "closing. You are now a permanent feature of the bar."
    ),
    "bob-game-over-bar-bouncer": G(
      "Game Over: Bar fight (bouncer)",
      BG.bar,
      "GAME OVER. The bouncer wins. He always does. He is the size of a " +
        "small horse."
    ),
    "bob-game-over-coward": G(
      "Game Over: Coward",
      BG.bar,
      "GAME OVER. You backed away slowly. You kept backing away. You backed " +
        "out of your own life."
    ),
    "bob-game-over-bus": G(
      "Game Over: Bus",
      BG.busCrash,
      "GAME OVER. The bus wins. The bus always wins."
    ),
    "bob-game-over-brick": G(
      "Game Over: Brick wall",
      BG.brickWall,
      "GAME OVER. You stared at the wall. The wall outlived you."
    ),
    "bob-game-over-ad": G(
      "Game Over: 555-LIFE",
      BG.adSpace,
      "GAME OVER. You memorized the number. You never called. Life noticed."
    ),
    "bob-game-over-broke-flowers": G(
      "Game Over: Broke (tulip)",
      BG.tulipRoom,
      "GAME OVER. €200 well spent. On a tulip. You can't eat a tulip. You " +
        "tried."
    ),
    "bob-game-over-thrown": G(
      "Game Over: Thrown out",
      BG.flowerShop,
      "GAME OVER. Elli threw you out. The curb was warmer than your old life."
    ),
    "bob-game-over-flower-shop": G(
      "Game Over: Empty-handed",
      BG.flowerShop,
      "GAME OVER. You left empty-handed. Elli's stare follows you home. " +
        "Forever."
    ),
    "bob-game-over-stand-up": G(
      "Game Over: Briefly stood",
      BG.park,
      "GAME OVER. You stood up. Then sat down. The pigeons applauded the " +
        "effort. The day ended without you."
    ),
    "bob-game-over-broke": G(
      "Game Over: Broke",
      BG.park,
      "GAME OVER. You are broke and the raccoon has your job now."
    ),
    "bob-game-over-bench": G(
      "Game Over: Benched",
      BG.park,
      "GAME OVER — BENCHED. Bob is now park furniture. He is finally useful " +
        "to society."
    ),
    "bob-game-over-shroom": G(
      "Game Over: Bad trip",
      BG.trip,
      "GAME OVER. The mushroom was not a friend. The mushroom never was."
    ),
    "bob-game-over-pushups": G(
      "Game Over: Pumped",
      BG.gym,
      "GAME OVER. Pumped, but not smart. Not rich. Not anything else. " +
        "Push-ups alone do not a life make."
    ),
    "bob-game-over-crushed": G(
      "Game Over: Crushed",
      BG.gym,
      "GAME OVER. 700 kg was too much. The barbell waves at you " +
        "sympathetically."
    ),
  });
})();
