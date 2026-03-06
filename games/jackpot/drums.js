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

// Pay table — designed for ~92% RTP with 20-stop reels
const PAY_TABLE = {
  seven: { 3: 150 }, // 777 jackpot
  bar: { 3: 50 }, // BAR BAR BAR
  mixed: 20, // any mix of 7s and BARs
  bell: { 3: 18 },
  cherry: { 3: 10, 2: 5, 1: 2 }, // partial cherry wins (classic mechanic)
  orange: { 3: 8 },
  lemon: { 3: 8 },
  plum: { 3: 8 },
};

// ── Drum class ───────────────────────────────────────────
class Drum {
  constructor(id) {
    this.id = id;
    // Each drum has a strip of symbols (we repeat them for wrap-around)
    this.strip = this.generateStrip();
    this.position = 0; // Current position in pixels
    this.targetSymbolIndex = 0; // Where we want to stop
    this.speed = 0; // Current spin speed
    this.spinning = false;
    this.stopping = false;
    this.stopped = true;
    this.symbolHeight = 90; // Height of each symbol cell
    this.stopDelay = 0; // Delay before this drum starts stopping
  }

  generateStrip() {
    // Fixed reel strips — each drum has a deliberate sequence like a real machine.
    // S = shorthand lookup
    const S = {};
    for (const sym of SYMBOLS) S[sym.name[0]] = sym; // c,l,o,p,b
    S["7"] = SYMBOLS.find((s) => s.name === "seven");
    S["B"] = SYMBOLS.find((s) => s.name === "bar");
    S["b"] = SYMBOLS.find((s) => s.name === "bell");

    // Realistic reel strips — weighted for ~92% RTP
    // Drum 0: cherry×5 lemon×4 orange×4 plum×3 bell×2 bar×1 seven×1
    // Drum 1: cherry×3 lemon×4 orange×4 plum×4 bell×2 bar×2 seven×1
    // Drum 2: cherry×3 lemon×4 orange×4 plum×3 bell×2 bar×3 seven×1
    const strips = [
      "c l o p c o l b c p o l c p b l o c B 7".split(" "),
      "l o p c l o p b l p o c l B p o b c B 7".split(" "),
      "o l p c o l B p o l c b o l B p b c B 7".split(" "),
    ];

    const map = { c: S.c, l: S.l, o: S.o, p: S.p, b: S.b, B: S.B, 7: S["7"] };
    return strips[this.id].map((key) => map[key]);
  }

  get visibleSymbols() {
    const totalHeight = this.strip.length * this.symbolHeight;
    const pos = ((this.position % totalHeight) + totalHeight) % totalHeight;
    const idx = Math.floor(pos / this.symbolHeight);
    return [
      this.strip[(idx - 2 + this.strip.length) % this.strip.length],
      this.strip[(idx - 1 + this.strip.length) % this.strip.length],
      this.strip[idx % this.strip.length],
      this.strip[(idx + 1) % this.strip.length],
      this.strip[(idx + 2) % this.strip.length],
    ];
  }

  get centerSymbol() {
    return this.visibleSymbols[2];
  }

  spin() {
    this.spinning = true;
    this.stopping = false;
    this.stopped = false;
    this.speed = 25 + Math.random() * 5;
  }

  beginStop(targetIndex) {
    this.targetSymbolIndex = targetIndex;
    this.stopping = true;

    const totalHeight = this.strip.length * this.symbolHeight;
    const targetPos = targetIndex * this.symbolHeight;

    // Place target at least 1 full revolution ahead of current position
    let futureTarget = targetPos;
    while (futureTarget < this.position + totalHeight) {
      futureTarget += totalHeight;
    }
    this.stopStartPosition = this.position;
    this.stopTargetPosition = futureTarget;
    this.stopProgress = 0;
  }

  update() {
    if (!this.spinning) return;

    if (this.stopping) {
      this.stopProgress += 0.015;
      if (this.stopProgress >= 1) {
        // Snap exactly to target
        const totalHeight = this.strip.length * this.symbolHeight;
        this.position = this.targetSymbolIndex * this.symbolHeight;
        this.speed = 0;
        this.spinning = false;
        this.stopping = false;
        this.stopped = true;
        playStopSound();
        return;
      }
      // Cubic ease-out for smooth deceleration
      const t = 1 - Math.pow(1 - this.stopProgress, 3);
      this.position =
        this.stopStartPosition +
        (this.stopTargetPosition - this.stopStartPosition) * t;
    } else {
      this.position += this.speed;
      const totalHeight = this.strip.length * this.symbolHeight;
      this.position = this.position % totalHeight;
    }
  }

  get fractionalOffset() {
    return this.position % this.symbolHeight;
  }
}
