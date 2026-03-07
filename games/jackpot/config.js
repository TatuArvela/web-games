// ── Symbols ──────────────────────────────────────────────
const SYMBOLS = [
  { name: "cherry", emoji: "🍒", color: "#e74c3c" },
  { name: "lemon", emoji: "🍋", color: "#f1c40f" },
  { name: "orange", emoji: "🍊", color: "#e67e22" },
  { name: "plum", emoji: "🍇", color: "#8e44ad" },
  { name: "bell", emoji: "🔔", color: "#f39c12" },
  { name: "bar", emoji: "BAR", color: "#222" },
  { name: "seven", emoji: "7", color: "#e74c3c" },
];

// ── Reel strips ──────────────────────────────────────────
// Classic-weighted 20-stop reels — ~94% RTP
// Drum 0: cherry×5 lemon×4 orange×4 plum×3 bell×2 bar×1 seven×1
// Drum 1: cherry×4 lemon×4 orange×3 plum×3 bell×3 bar×2 seven×1
// Drum 2: cherry×3 lemon×4 orange×3 plum×3 bell×3 bar×3 seven×1
const REEL_STRIPS = (function () {
  const S = {};
  for (const sym of SYMBOLS) S[sym.name[0]] = sym;
  S["7"] = SYMBOLS.find((s) => s.name === "seven");
  S["B"] = SYMBOLS.find((s) => s.name === "bar");
  S["b"] = SYMBOLS.find((s) => s.name === "bell");

  const raw = [
    "c l o p c o l b c p o l c p b l o c B 7",
    "c l o p b c l o p b l c B o p b l B c 7",
    "o l p c b o l B p b l B c o b l p B c 7",
  ];

  const map = { c: S.c, l: S.l, o: S.o, p: S.p, b: S.b, B: S.B, 7: S["7"] };
  return raw.map((str) => str.split(" ").map((key) => map[key]));
})();

// ── Pay table ────────────────────────────────────────────
// Classic payout hierarchy — ~94% RTP with 20-stop reels
const PAY_TABLE = {
  seven: { 3: 200 }, // 777 jackpot
  bar: { 3: 50 }, // BAR BAR BAR
  mixed: 15, // any mix of 7s and BARs
  bell: { 3: 20 },
  cherry: { 3: 10, 2: 5, 1: 2 }, // partial cherry wins (classic mechanic)
  orange: { 3: 10 },
  plum: { 3: 8 },
  lemon: { 3: 5 },
};
