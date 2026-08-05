// True Ending — reached after winning with all three characters.
//
// These are the only scenes not owned by a specific playable character: they
// run after the cumulative achievement of three character wins, so the
// "current character" context is meaningless here. The stat tracker stays
// hidden (no stats declared) since this is a meta epilogue, not gameplay.

(function () {
  const { BG, BACK_TO_MENU, registerScenes } = window;

  registerScenes({
    convergence: {
      character: "shared",
      title: "Convergence",
      bg: BG.cosmos,
      text:
        "Bob the Smart. Willie the Rich. Peter the Stable. Three lives, lived. " +
        "You stand together in a white room. The Life Game looks back at you. " +
        "It speaks.",
      choices: [
        { label: "Listen", goto: "final-truth" },
        { label: "Walk away", goto: "final-walk" },
      ],
    },
    "final-truth": {
      character: "shared",
      title: "The Life Game speaks",
      bg: BG.cosmos,
      text:
        '"You are the player. They are the lives. I am the Life Game. ' +
        'Three lives lived in full. Now the question — was it worth it?"',
      choices: [{ label: "Yes", goto: "win-true" }],
    },
    "final-walk": {
      character: "shared",
      title: "Walk away",
      bg: BG.cosmos,
      text:
        "You walk out. The Life Game lets out a breath it's been holding for years.",
      choices: [{ label: "Become the game", goto: "win-cycle" }],
    },
    "win-true": {
      character: "shared",
      title: "True Ending",
      bg: BG.cosmos,
      text:
        "YOU WIN — THE TRUE ENDING. Same as the regular ending, but you get " +
        "a sense of pride and accomplishment.",
      ending: "win",
      choices: [BACK_TO_MENU],
    },
    "win-cycle": {
      character: "shared",
      title: "You ARE the Life Game",
      bg: BG.cosmos,
      text:
        "YOU WIN — YOU ARE THE LIFE GAME. Time to run your own. The cycle continues.",
      ending: "win",
      choices: [BACK_TO_MENU],
    },
  });
})();
