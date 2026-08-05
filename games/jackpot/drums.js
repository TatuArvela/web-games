class Drum {
  constructor(strip) {
    this.strip = strip;
    this.position = 0;
    this.targetSymbolIndex = 0;
    this.speed = 0;
    this.spinning = false;
    this.stopping = false;
    this.stopped = true;
    this.symbolHeight = 90;
    this.stopDelay = 0;
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
        const totalHeight = this.strip.length * this.symbolHeight;
        this.position = this.targetSymbolIndex * this.symbolHeight;
        this.speed = 0;
        this.spinning = false;
        this.stopping = false;
        this.stopped = true;
        playStopSound();
        return;
      }

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
