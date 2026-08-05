const SYMBOLS = [
  { name: "cherry", emoji: "🍒" },
  { name: "lemon", emoji: "🍋" },
  { name: "orange", emoji: "🍊" },
  { name: "plum", emoji: "🍇" },
  { name: "bell", emoji: "🔔" },
  { name: "bar", emoji: "BAR" },
  { name: "seven", emoji: "7" },
];

// Drum 0: cherry×5 lemon×4 orange×4 plum×3 bell×2 bar×1 seven×1
// Drum 1: cherry×4 lemon×4 orange×3 plum×3 bell×3 bar×2 seven×1
// Drum 2: cherry×3 lemon×4 orange×3 plum×3 bell×3 bar×3 seven×1
const REEL_STRIPS = (function () {
  const byName = Object.fromEntries(SYMBOLS.map((s) => [s.name, s]));
  const map = {
    c: byName.cherry,
    l: byName.lemon,
    o: byName.orange,
    p: byName.plum,
    b: byName.bell,
    B: byName.bar,
    7: byName.seven,
  };

  const raw = [
    "c l o p c o l b c p o l c p b l o c B 7",
    "c l o p b c l o p b l c B o p b l B c 7",
    "o l p c b o l B p b l B c o b l p B c 7",
  ];

  return raw.map((str) => str.split(" ").map((key) => map[key]));
})();

// Classic payout hierarchy — ~94% RTP with 20-stop reels
const PAY_TABLE = {
  seven: { 3: 200 },
  bar: { 3: 50 },
  mixed: 15, // any mix of 7s and BARs
  bell: { 3: 20 },
  cherry: { 3: 10, 2: 5, 1: 2 }, // partial cherry wins
  orange: { 3: 10 },
  plum: { 3: 8 },
  lemon: { 3: 5 },
};
