// ── Drum class ───────────────────────────────────────────
// Generic spinning drum — takes a strip of symbol objects
class Drum {
  constructor(strip) {
    this.strip = strip;
    this.position = 0; // Current position in pixels
    this.targetSymbolIndex = 0; // Where we want to stop
    this.speed = 0; // Current spin speed
    this.spinning = false;
    this.stopping = false;
    this.stopped = true;
    this.symbolHeight = 90; // Height of each symbol cell
    this.stopDelay = 0; // Delay before this drum starts stopping
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
