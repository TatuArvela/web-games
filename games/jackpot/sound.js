// ── Sound generation (Web Audio) ─────────────────────────
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, duration, type = "square", volume = 0.1) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioCtx.currentTime + duration,
  );
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playSpinSound() {
  playTone(300, 0.04, "triangle", 0.03);
}

function playStopSound() {
  playTone(400, 0.15, "sine", 0.12);
}

function playWinSound() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, "sine", 0.15), i * 120);
  });
}

function playLeverSound() {
  playTone(400, 0.12, "triangle", 0.07);
  setTimeout(() => playTone(300, 0.1, "triangle", 0.06), 80);
}

function playInsertCoinSound() {
  playTone(800, 0.08, "sine", 0.1);
  setTimeout(() => playTone(1200, 0.08, "sine", 0.1), 80);
}

function playLoseSound() {
  playTone(200, 0.3, "sine", 0.08);
  setTimeout(() => playTone(150, 0.4, "sine", 0.08), 150);
}
