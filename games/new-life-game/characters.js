// Character data for New Life Game.
// Used by character select + confirm screens, and consumed by scenes.js for branching.

const CHARACTERS = {
  bob: {
    id: "bob",
    name: "Bob Swole",
    shortName: "Bob",
    age: 21,
    difficulty: "Easy",
    portrait: "images/bob.png",
    startScene: "bob-start",
    statDeltas: { intelligence: -1, money: +1, fitness: +1 },
    bio: [
      "Bob has a difficulty level of Easy.",
      "Bob is 21 years old.",
      "Bob has red hair.",
      "Bob has low intelligence.",
      "Bob has 500 money.",
      "Bob is fit.",
      "Bob enjoys the nature.",
      "Bob likes mushrooms.",
    ],
  },
  willie: {
    id: "willie",
    name: "Willie Bold",
    shortName: "Willie",
    age: 25,
    difficulty: "Medium",
    portrait: "images/willie.png",
    startScene: "willie-start",
    statDeltas: { intelligence: +1, money: -1, fitness: -1 },
    bio: [
      "Willie has a difficulty level of Medium.",
      "Willie is 25 years old.",
      "Willie has yellow hair.",
      "Willie has high intelligence.",
      "Willie has 150 money.",
      "Willie is not very fit.",
      "Willie has a high work motivation.",
      "Willie likes tomatoes.",
    ],
  },
  peter: {
    id: "peter",
    name: "Peter Deuce",
    shortName: "Peter",
    age: 47,
    difficulty: "Hard",
    portrait: "images/peter.png",
    startScene: "peter-start",
    statDeltas: { intelligence: -1, money: -1, fitness: -1 },
    bio: [
      "Peter has a difficulty level of Hard.",
      "Peter is 47 years old.",
      "Peter has no hair.",
      "Peter has no intelligence.",
      "Peter has no money.",
      "Peter is not fit.",
      "Peter is highly unstable.",
      "Peter emits unusual levels of radiation.",
    ],
  },

  // Bonus characters — only used in the Extras fight, not in selection.
  loser: {
    id: "loser",
    name: "Loser",
    shortName: "Loser",
    portrait: "images/loser.png",
  },
  "jam-dude": {
    id: "jam-dude",
    name: "Jam Dude",
    shortName: "Jam Dude",
    portrait: "images/jam-dude.png",
  },
};

window.CHARACTERS = CHARACTERS;
