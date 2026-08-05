const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// One-shot burst of filtered white noise with an exponential volume decay —
// the shared body of every percussive/mechanical sound (reel clack, lever snap,
// coin clink). `delay` schedules the burst for later without a separate timer.
function playFilteredNoise({
  duration,
  volume,
  filterType = "lowpass",
  frequency,
  Q = 1,
  delay = 0,
}) {
  setTimeout(() => {
    const now = audioCtx.currentTime;
    const bufferSize = Math.ceil(audioCtx.sampleRate * duration);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = frequency;
    filter.Q.value = Q;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    source.start(now);
    source.stop(now + duration);
  }, delay);
}

function playNoise(duration, volume = 0.05, cutoff = 2000) {
  playFilteredNoise({ duration, volume, filterType: "lowpass", frequency: cutoff });
}

function playSpinSound() {
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
  playNoise(0.04, 0.08, 4000);
}

function organNote(freq, startMs, dur, vol = 0.12, droop = 1.0) {
  setTimeout(() => {
    const now = audioCtx.currentTime;
    [1, 2, 3, 4].forEach((h, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq * h, now);
      if (droop < 1.0) {
        osc.frequency.setValueAtTime(freq * h, now + dur - 0.25);
        osc.frequency.exponentialRampToValueAtTime(freq * h * droop, now + dur);
      }
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

function playWinSound(winAmount = 0) {
  if (winAmount <= 0) return;

  if (winAmount < 15) {
    organNote(523, 0, 0.09); // C5
    organNote(659, 90, 0.09); // E5
    organNote(784, 180, 0.18); // G5
    return;
  }

  if (winAmount < 100) {
    const mediumS = 120;
    organNote(523, 0*mediumS, 0.11); // C5
    organNote(659, 1*mediumS, 0.11); // E5
    organNote(784, 2*mediumS, 0.11); // G5
    organNote(659, 3*mediumS, 0.11); // E5
    organNote(880, 4*mediumS, 0.11); // A5
    organNote(784, 5*mediumS, 0.11); // G5
    organNote(659, 6*mediumS, 0.11); // E5
    organNote(1047, 7*mediumS, 0.40, 0.14); // C6
    return;
  }

  const bigS = 110;
  organNote(523, 0*bigS, 0.13); // C5
  organNote(659, 1*bigS, 0.13); // E5
  organNote(784, 2*bigS, 0.13); // G5
  organNote(1047, 3*bigS, 0.20, 0.14); // C6
  organNote(1319, 4*bigS, 0.13, 0.13); // E6
  organNote(1047, 5*bigS, 0.13); // C6
  organNote(784, 6*bigS, 0.10); // G5
  organNote(880, 7*bigS, 0.10); // A5
  organNote(784, 8*bigS, 0.10); // G5
  organNote(659, 9*bigS, 0.10); // E5
  organNote(784, 10*bigS, 0.13); // G5
  organNote(1047, 11*bigS, 0.55, 0.15); // C6
}

function playLeverSound() {
  const snap = (delay, volume) =>
    playFilteredNoise({
      duration: 0.022,
      volume,
      filterType: "bandpass",
      frequency: 1100,
      Q: 0.9,
      delay,
    });

  snap(0, 0.38);
  snap(40, 0.28);
  snap(75, 0.18);
}

function playInsertCoinSound() {
  const microBurst = (delay, volume, frequency) =>
    playFilteredNoise({
      duration: 0.006 + Math.random() * 0.005,
      volume,
      filterType: "bandpass",
      frequency,
      Q: 0.5,
      delay,
    });

  const v = 0.7 + Math.random() * 0.6;
  const p = 0.85 + Math.random() * 0.3;
  microBurst(0,  0.22 * v, 1800 * p);
  microBurst(9,  0.11 * v, 2400 * p);
  microBurst(17, 0.05 * v, 3000 * p);
  microBurst(24, 0.02 * v, 3500 * p);
}

function playButtonSound() {
  const now = audioCtx.currentTime;

  // low plastic "knock" body
  const knock = audioCtx.createOscillator();
  const knockGain = audioCtx.createGain();
  knock.type = "sine";
  knock.frequency.setValueAtTime(185, now);
  knock.frequency.exponentialRampToValueAtTime(150, now + 0.03);
  knockGain.gain.setValueAtTime(0.0001, now);
  knockGain.gain.exponentialRampToValueAtTime(0.16, now + 0.002);
  knockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
  knock.connect(knockGain);
  knockGain.connect(audioCtx.destination);
  knock.start(now);
  knock.stop(now + 0.05);

  // short fixed-pitch "tick" — a brief click, no glide (avoids the chirp)
  const tick = audioCtx.createOscillator();
  const tickGain = audioCtx.createGain();
  tick.type = "triangle";
  tick.frequency.setValueAtTime(1150, now);
  tickGain.gain.setValueAtTime(0.0001, now);
  tickGain.gain.exponentialRampToValueAtTime(0.08, now + 0.001);
  tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.011);
  tick.connect(tickGain);
  tickGain.connect(audioCtx.destination);
  tick.start(now);
  tick.stop(now + 0.014);
}

function playLoseSound() {
  organNote(554, 0, 0.38); // C#5
  organNote(523, 420, 0.38); // C5
  organNote(494, 840, 0.38); // B4
  organNote(466, 1260, 1.40, 0.12, 0.97); // A#4
}
