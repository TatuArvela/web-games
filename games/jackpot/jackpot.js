const canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 600;
const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;
const updateIntervalMs = 10;

// ── Game state ───────────────────────────────────────────
let credits = 5;
let lastWin = 0;
let state = "idle"; // idle | spinning | stopping | showing-win
let winFlashTimer = 0;
let pendingPayout = 0; // coins yet to be paid out
let payoutTimer = 0; // ms since last coin dropped
let fallingCoins = []; // animated coins dropping from slot

// Arm animation
let armPullOffset = 0; // 0 = resting, positive = pulled down
let armAnimating = false;
let armDirection = 0; // 1 = pulling, -1 = releasing

// ── Layout constants ─────────────────────────────────────
const topMargin = 200;
const bottomMargin = 120;
const rightMargin = 120;

const frameWidth = canvas.width - rightMargin;
const frameHeight = canvas.height - topMargin - bottomMargin;

const drumsHorizontalMargin = 140;
const drumsVerticalMargin = 25;
const drumsWidth = frameWidth - drumsHorizontalMargin * 2;
const drumsHeight = frameHeight - drumsVerticalMargin * 2;
const drums = Array.from({ length: 3 }, (_, i) => new Drum(i));

// ── Game logic ───────────────────────────────────────────
function pullLever() {
  if (state !== "idle") return;
  if (credits < 1) {
    return;
  }
  audioCtx.resume();
  credits -= 1;
  lastWin = 0;
  state = "spinning";

  // Animate arm
  armAnimating = true;
  armDirection = 1;
  armPullOffset = 0;

  playLeverSound();

  // Start all drums spinning
  drums.forEach((d) => d.spin());

  // Pick results
  const results = drums.map((d) => {
    const idx = Math.floor(Math.random() * d.strip.length);
    return idx;
  });

  // Stagger the stops
  drums.forEach((d, i) => {
    setTimeout(
      () => {
        d.beginStop(results[i]);
      },
      1200 + i * 600,
    );
  });

  // After all stopped, evaluate
  setTimeout(
    () => {
      evaluateResult();
    },
    1200 + 3 * 600 + 500,
  );
}

function evaluateResult() {
  const symbols = drums.map((d) => d.centerSymbol);
  const names = symbols.map((s) => s.name);

  let winAmount = 0;

  const allSevens = names.every((n) => n === "seven");
  const allBars = names.every((n) => n === "bar");
  const allSevenOrBar = names.every((n) => n === "seven" || n === "bar");

  if (allSevens) {
    winAmount = PAY_TABLE["seven"][3];
  } else if (allBars) {
    winAmount = PAY_TABLE["bar"][3];
  } else if (allSevenOrBar) {
    winAmount = PAY_TABLE["mixed"];
  } else if (
    names[0] === names[1] &&
    names[1] === names[2] &&
    PAY_TABLE[names[0]]
  ) {
    winAmount = PAY_TABLE[names[0]][3];
  } else if (names[0] === "cherry" && names[1] === "cherry") {
    winAmount = PAY_TABLE["cherry"][2];
  } else if (names[0] === "cherry") {
    winAmount = PAY_TABLE["cherry"][1];
  }

  if (winAmount > 0) {
    lastWin = winAmount;
    pendingPayout = winAmount;
    payoutTimer = 0;
    state = "showing-win";
    winFlashTimer = 0;
    playWinSound();
  } else {
    lastWin = 0;
    state = "idle";
    playLoseSound();

    if (credits <= 0) {
      // No auto-refill — machine stays dark
    }
  }
}

// ── Click / touch handling ───────────────────────────────
function getCanvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

canvas.addEventListener("click", (e) => {
  const { x, y } = getCanvasCoords(e);

  // Arm / ball area
  if (x > 680 && y < canvas.height / 2) {
    pullLever();
    return;
  }

  // Coin slot area (decorative, near tray)
  if (x > trayX + trayW && y > trayY - 30 && y < trayY + trayH + 30) {
    return;
  }

  // Anywhere on machine body during idle → pull
  if (state === "idle" && x < 680) {
    pullLever();
  }
});

canvas.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    if (x > 680 && y < canvas.height / 2) {
      pullLever();
    } else if (x > trayX + trayW && y > trayY - 30 && y < trayY + trayH + 30) {
      // coin slot - decorative
    } else if (state === "idle") {
      pullLever();
    }
  },
  { passive: false },
);

// Keyboard support
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "Enter") {
    e.preventDefault();
    pullLever();
  }
  if (e.code === "ArrowUp" || e.code === "ArrowRight") {
    // reserved
  }
});

// ── Tick sound during spin ───────────────────────────────
let spinTickCounter = 0;

// ── Update ───────────────────────────────────────────────
function update() {
  drums.forEach((d) => d.update());

  // Arm animation
  if (armAnimating) {
    if (armDirection === 1) {
      armPullOffset += 8;
      if (armPullOffset >= 120) {
        armPullOffset = 120;
        armDirection = -1;
      }
    } else {
      armPullOffset -= 4;
      if (armPullOffset <= 0) {
        armPullOffset = 0;
        armAnimating = false;
        armDirection = 0;
      }
    }
  }

  // Win flash timer
  if (state === "showing-win") {
    winFlashTimer += updateIntervalMs;
  }

  // Payout animation: drop coins one at a time
  if (state === "showing-win" && pendingPayout > 0) {
    payoutTimer += updateIntervalMs;
    if (payoutTimer >= 120) {
      // one coin every 120ms
      payoutTimer = 0;
      credits += 1;
      pendingPayout -= 1;
      playInsertCoinSound();
      // Spawn a falling coin from the payout slot
      const slotCenterX = trayX + trayW / 2 + (Math.random() - 0.5) * 80;
      fallingCoins.push({
        x: slotCenterX,
        y: trayY - 2,
        vy: 0,
        targetY: trayY + trayH - 10 - Math.random() * 8,
        done: false,
      });
      if (pendingPayout <= 0) {
        // All coins paid, linger briefly then go idle
        setTimeout(() => {
          state = "idle";
        }, 600);
      }
    }
  }

  // Update falling coins
  for (const fc of fallingCoins) {
    if (fc.done) continue;
    fc.vy += 0.6; // gravity
    fc.y += fc.vy;
    if (fc.y >= fc.targetY) {
      fc.y = fc.targetY;
      fc.vy *= -0.3; // small bounce
      if (Math.abs(fc.vy) < 0.5) fc.done = true;
    }
  }
  // Remove settled falling coins (they become tray coins via updateCoinPositions)
  fallingCoins = fallingCoins.filter((fc) => !fc.done);

  // Spin tick sounds
  if (state === "spinning" || drums.some((d) => d.spinning)) {
    spinTickCounter++;
    if (spinTickCounter % 12 === 0) {
      playSpinSound();
    }
  } else {
    spinTickCounter = 0;
  }
}

// ── Main draw ────────────────────────────────────────────
function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  drawSignBase();
  drawSignLights();
  drawLogo();

  drawTop();
  drawWins();
  drawWinsText();

  drawBottom();
  drawPrizeSlot();

  drawArmBase();
  drawArm();
  drawArmBall();

  drawDrums();
  drawFrame();

  drawCoinTray();
  drawCoins();
  drawCoinSlot();
  drawWinOverlay();

  requestAnimationFrame(draw);
}

setInterval(() => update(), updateIntervalMs);
requestAnimationFrame(draw);
