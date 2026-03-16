// ── Sound generation (Web Audio) ─────────────────────────
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playNoise(duration, volume = 0.05, cutoff = 2000) {
  const bufferSize = Math.ceil(audioCtx.sampleRate * duration);
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = cutoff;
  const gain = audioCtx.createGain();
  const now = audioCtx.currentTime;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  source.start();
  source.stop(now + duration);
}

function playSpinSound() {
  // Mechanical reel click: short descending tick
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.045);
  gain.gain.setValueAtTime(0.09, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.045);
}

function playStopSound() {
  // Satisfying thunk when reel locks in place
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(55, now + 0.18);
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.22);
  // Sharp click accent
  playNoise(0.04, 0.08, 4000);
}

function playWinSound(winAmount = 0) {
  if (winAmount <= 0) return;

  // Electrical organ: stack harmonics like a drawbar organ
  function organNote(freq, startMs, dur, vol = 0.12) {
    setTimeout(() => {
      const now = audioCtx.currentTime;
      [1, 2, 3, 4].forEach((h, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq * h;
        const hVol = vol / (i + 1);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(hVol, now + 0.012);
        gain.gain.setValueAtTime(hVol, now + dur - 0.03);
        gain.gain.linearRampToValueAtTime(0.0001, now + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + dur);
      });
    }, startMs);
  }

  if (winAmount < 15) {
    // Small win: quick 3-note ascending ding
    organNote(523, 0,   0.09); // C5
    organNote(659, 90,  0.09); // E5
    organNote(784, 180, 0.18); // G5 — held briefly
    return;
  }

  if (winAmount >= 100) {
    // Jackpot: long triumphant fanfare with a turnaround
    // C5  E5  G5  C6  E6  C6  G5  A5  G5  E5  G5  C6(held)
    const s = 110;
    organNote(523,  0*s, 0.13);
    organNote(659,  1*s, 0.13);
    organNote(784,  2*s, 0.13);
    organNote(1047, 3*s, 0.20, 0.14);
    organNote(1319, 4*s, 0.13, 0.13);
    organNote(1047, 5*s, 0.13);
    organNote(784,  6*s, 0.10);
    organNote(880,  7*s, 0.10);
    organNote(784,  8*s, 0.10);
    organNote(659,  9*s, 0.10);
    organNote(784,  10*s, 0.13);
    organNote(1047, 11*s, 0.55, 0.15);
  } else {
    // Regular big win: bouncy 8-note phrase
    // C5  E5  G5  E5  A5  G5  E5  C6(held)
    const s = 120;
    organNote(523,  0*s, 0.11);
    organNote(659,  1*s, 0.11);
    organNote(784,  2*s, 0.11);
    organNote(659,  3*s, 0.11);
    organNote(880,  4*s, 0.11);
    organNote(784,  5*s, 0.11);
    organNote(659,  6*s, 0.11);
    organNote(1047, 7*s, 0.40, 0.14);
  }
}

function playLeverSound() {
  function snap(delayMs, vol) {
    setTimeout(() => {
      const now = audioCtx.currentTime;
      const dur = 0.022;
      const bufferSize = Math.ceil(audioCtx.sampleRate * dur);
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1100;
      filter.Q.value = 0.9;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      source.start(now);
      source.stop(now + dur);
    }, delayMs);
  }

  snap(0, 0.38);
  snap(40, 0.28);
  snap(75, 0.18);
}

function playInsertCoinSound() {
  // Coin clink: compound jitter — several micro noise bursts simulating bounce/settle
  function microBurst(delayMs, vol, cutoff) {
    setTimeout(() => {
      const now = audioCtx.currentTime;
      const dur = 0.006 + Math.random() * 0.005;
      const bufferSize = Math.ceil(audioCtx.sampleRate * dur);
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = cutoff;
      filter.Q.value = 0.5;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      source.start(now);
      source.stop(now + dur);
    }, delayMs);
  }

  const v = 0.7 + Math.random() * 0.6; // volume scale 0.7–1.3
  const p = 0.85 + Math.random() * 0.3; // pitch scale 0.85–1.15
  microBurst(0,  0.22 * v, 1800 * p);
  microBurst(9,  0.11 * v, 2400 * p);
  microBurst(17, 0.05 * v, 3000 * p);
  microBurst(24, 0.02 * v, 3500 * p);
}

function playLoseSound() {
  // 4-tone descending jingle: G3 → F3 → Eb3 → C3 (C minor descent), last note sustained
  function loseNote(freq, startMs, dur, droop = 1.0) {
    setTimeout(() => {
      const now = audioCtx.currentTime;
      [1, 2, 3].forEach((h, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq * h, now);
        if (droop < 1.0) {
          osc.frequency.setValueAtTime(freq * h, now + dur - 0.25);
          osc.frequency.exponentialRampToValueAtTime(freq * h * droop, now + dur);
        }
        const vol = 0.11 / (i + 1);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(vol, now + 0.07);
        gain.gain.setValueAtTime(vol, now + dur - 0.18);
        gain.gain.linearRampToValueAtTime(0.0001, now + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + dur);
      });
    }, startMs);
  }

  loseNote(554, 0,    0.38);        // C#5
  loseNote(523, 420,  0.38);        // C5
  loseNote(494, 840,  0.38);        // B4
  loseNote(466, 1260, 1.40, 0.97);  // A#4 — sustained, very subtle droop
}
