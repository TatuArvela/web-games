// Extras: Loser vs Jam Dude fight.
//
// Reached only from the Extras menu (playScene("fight-intro")), not from a
// playable character's scene graph. Bonus characters live in characters.js
// and are referenced by portrait path only — no stat-tracking applies here.

(function () {
  const { BG, registerScenes } = window;

  const portraits = {
    portrait: "images/loser.png",
    portraitRight: "images/jam-dude.png",
  };

  registerScenes({
    "fight-intro": {
      character: "extras",
      title: "Fight — Intro",
      bg: BG.fight,
      ...portraits,
      text: "Welcome to LOSER vs JAM DUDE! 🥊 The crowd is mostly confused.",
      choices: [{ label: "Begin", goto: "fight-round-1" }],
    },
    "fight-round-1": {
      character: "extras",
      title: "Fight — Round 1",
      bg: BG.fight,
      ...portraits,
      text: "Round 1! Loser flexes. Jam Dude oozes menacingly. Whom do you back?",
      choices: [
        { label: "Cheer for Loser", goto: "fight-round-2-loser" },
        { label: "Cheer for Jam Dude", goto: "fight-round-2-jam" },
        { label: "Just boo", goto: "fight-round-2-boo" },
      ],
    },
    "fight-round-2-loser": {
      character: "extras",
      title: "Fight — Round 2 (Loser)",
      bg: BG.fight,
      ...portraits,
      text:
        "Loser hears you and starts crying with confidence. Jam Dude is unnerved.",
      choices: [{ label: "Round 3", goto: "fight-round-3-loser" }],
    },
    "fight-round-3-loser": {
      character: "extras",
      title: "Fight — Round 3 (Loser)",
      bg: BG.fight,
      ...portraits,
      text:
        "Loser steps forward. Jam Dude steps in jam. He slips on himself. " +
        "The crowd gasps. The referee, also confused, calls it a strike.",
      choices: [{ label: "Finish it", goto: "fight-loser-wins" }],
    },
    "fight-round-2-jam": {
      character: "extras",
      title: "Fight — Round 2 (Jam)",
      bg: BG.jam,
      ...portraits,
      text:
        "Jam Dude grins. He extrudes a strawberry tendril toward the ring.",
      choices: [{ label: "Round 3", goto: "fight-round-3-jam" }],
    },
    "fight-round-3-jam": {
      character: "extras",
      title: "Fight — Round 3 (Jam)",
      bg: BG.jam,
      ...portraits,
      text:
        "Loser punches Jam Dude. His fist sinks in to the wrist and stays " +
        "there. They are now technically one entity. The referee adjusts his " +
        "glasses.",
      choices: [{ label: "Finish it", goto: "fight-jam-wins" }],
    },
    "fight-round-2-boo": {
      character: "extras",
      title: "Fight — Round 2 (Boo)",
      bg: BG.fight,
      ...portraits,
      text: "Both fighters look at you, hurt. They forget to fight.",
      choices: [{ label: "Ring the bell", goto: "fight-tie" }],
    },
    "fight-loser-wins": {
      character: "extras",
      title: "Fight — Loser wins",
      bg: BG.win,
      portrait: "images/loser.png",
      text: "LOSER WINS! By tears, by sheer audacity. The world is briefly fair.",
      choices: [{ label: "Back to extras", goto: "__extras__" }],
    },
    "fight-jam-wins": {
      character: "extras",
      title: "Fight — Jam Dude wins",
      bg: BG.jam,
      portraitRight: "images/jam-dude.png",
      text: "JAM DUDE WINS! 🍓 He is now the regional preserves champion.",
      choices: [{ label: "Back to extras", goto: "__extras__" }],
    },
    "fight-tie": {
      character: "extras",
      title: "Fight — Tie",
      bg: BG.fight,
      ...portraits,
      text: "It's a tie. Everyone goes home. Nobody learns anything.",
      choices: [{ label: "Back to extras", goto: "__extras__" }],
    },
  });
})();
