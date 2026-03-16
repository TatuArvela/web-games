const canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 600;
const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;
const updateIntervalMs = 10;

// ── Game state ───────────────────────────────────────────
let credits = 20;
let lastWin = 0;
let state = "idle"; // idle | spinning | stopping | showing-win
let winFlashTimer = 0;
let pendingPayout = 0; // coins yet to be paid out
let payoutTimer = 0; // ms since last coin dropped
let nextCoinDelay = 120; // ms until next coin drops (randomized each time)
let coins = []; // tray coins with physics: {x, y, vx, vy, settled}
const COIN_R = 13; // collision radius

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
const drums = REEL_STRIPS.map((strip) => new Drum(strip));

// ── Game logic ───────────────────────────────────────────
function placeTrayCoinsImmediate() {
  coins = [];
  const count = Math.min(credits, 50);
  const slotCenterX = trayX + trayW / 2;
  const floorY = trayY + trayH - 10;
  const leftX = trayX + 18;
  const rightX = trayX + trayW - 18;

  // Spawn coins staggered above the slot so they don't all overlap
  for (let i = 0; i < count; i++) {
    coins.push({
      x: slotCenterX + (Math.random() - 0.5) * 30,
      y: trayY - 5 - i * COIN_R * 2.5,
      vx: (Math.random() - 0.5) * 3,
      vy: 1,
      settled: false,
    });
  }

  // Run the same physics as update() silently until all coins settle
  for (let tick = 0; tick < 5000; tick++) {
    for (const coin of coins) {
      if (coin.settled) continue;
      coin.vy += 0.7;
      coin.x += coin.vx;
      coin.y += coin.vy;
      if (coin.x < leftX) {
        coin.x = leftX;
        coin.vx = Math.abs(coin.vx) * 0.4;
      }
      if (coin.x > rightX) {
        coin.x = rightX;
        coin.vx = -Math.abs(coin.vx) * 0.4;
      }
      for (const other of coins) {
        if (other === coin) continue;
        const dx = coin.x - other.x;
        const dy = coin.y - other.y;
        const distSq = dx * dx + dy * dy;
        const minDist = COIN_R * 2;
        if (distSq < minDist * minDist && distSq > 0.01) {
          const dist = Math.sqrt(distSq);
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;
          if (other.settled) {
            coin.x += nx * overlap;
            coin.y += ny * overlap * 0.15;
            const dot = coin.vx * nx;
            if (dot < 0) {
              coin.vx -= dot * nx * 1.3;
              coin.vx *= 0.6;
            }
          } else {
            coin.x += nx * overlap * 0.5;
            coin.y += ny * overlap * 0.15;
            other.x -= nx * overlap * 0.5;
            other.y -= ny * overlap * 0.15;
          }
        }
      }
      if (coin.y > floorY) {
        coin.y = floorY;
        coin.vy *= -0.35;
        coin.vx *= 0.75;
      }
      if (coin.y >= floorY - 2) {
        coin.vx *= 0.88;
        coin.vy *= 0.88;
      }
      if (
        Math.abs(coin.vy) < 0.4 &&
        Math.abs(coin.vx) < 0.3 &&
        coin.y >= floorY - COIN_R * 2
      ) {
        coin.settled = true;
        coin.vx = 0;
        coin.vy = 0;
      }
    }
    if (coins.every((c) => c.settled)) break;
  }
  // Force-settle any stragglers
  for (const coin of coins) {
    coin.settled = true;
    coin.vx = 0;
    coin.vy = 0;
  }
}

window.addEventListener("load", placeTrayCoinsImmediate);

function pullLever() {
  if (state !== "idle") return;
  if (credits < 1) {
    return;
  }
  audioCtx.resume();
  credits -= 1;
  // Remove one coin from the tray
  for (let i = coins.length - 1; i >= 0; i--) {
    if (coins[i].settled) {
      coins.splice(i, 1);
      break;
    }
  }
  playInsertCoinSound();
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

  // Stagger the stops — vary when the sequence starts, keep intervals constant
  const spinDelay = 1200 + Math.random() * 400;
  drums.forEach((d, i) => {
    setTimeout(
      () => {
        d.beginStop(results[i]);
      },
      spinDelay + i * 600,
    );
  });

  // After all stopped, evaluate
  setTimeout(
    () => {
      evaluateResult();
    },
    spinDelay + drums.length * 600 + 500,
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
    payoutTimer = -700; // delay before first coin drops
    state = "showing-win";
    winFlashTimer = 0;
    playWinSound(winAmount);
  } else {
    lastWin = 0;
    state = "idle";

    if (credits <= 0) {
      playLoseSound();
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
    if (payoutTimer >= nextCoinDelay) {
      payoutTimer = 0;
      nextCoinDelay = 80 + Math.random() * 120; // 80–200ms per coin
      credits += 1;
      pendingPayout -= 1;
      playInsertCoinSound();
      // Spawn a falling coin from the payout slot
      if (coins.length < 50) {
        const slotCenterX = trayX + trayW / 2 + (Math.random() - 0.5) * 30;
        coins.push({
          x: slotCenterX,
          y: trayY - 5,
          vx: (Math.random() - 0.5) * 2,
          vy: 1,
          settled: false,
        });
      }
      if (pendingPayout <= 0) {
        // All coins paid, linger briefly then go idle
        setTimeout(() => {
          state = "idle";
        }, 600);
      }
    }
  }

  // Update coin physics
  const floorY = trayY + trayH - 10;
  const leftX = trayX + 18;
  const rightX = trayX + trayW - 18;
  for (const coin of coins) {
    if (coin.settled) continue;
    coin.vy += 0.7;
    coin.x += coin.vx;
    coin.y += coin.vy;
    // Walls
    if (coin.x < leftX) {
      coin.x = leftX;
      coin.vx = Math.abs(coin.vx) * 0.4;
    }
    if (coin.x > rightX) {
      coin.x = rightX;
      coin.vx = -Math.abs(coin.vx) * 0.4;
    }
    // Coin-coin collisions — 2D detection, push mostly horizontal
    for (const other of coins) {
      if (other === coin) continue;
      const dx = coin.x - other.x;
      const dy = coin.y - other.y;
      const distSq = dx * dx + dy * dy;
      const minDist = COIN_R * 2;
      if (distSq < minDist * minDist && distSq > 0.01) {
        const dist = Math.sqrt(distSq);
        const overlap = minDist - dist;
        const nx = dx / dist;
        const ny = dy / dist;
        if (other.settled) {
          coin.x += nx * overlap;
          coin.y += ny * overlap * 0.15; // tiny vertical nudge for piling
          const dot = coin.vx * nx;
          if (dot < 0) {
            coin.vx -= dot * nx * 1.3;
            coin.vx *= 0.6;
          }
        } else {
          coin.x += nx * overlap * 0.5;
          coin.y += ny * overlap * 0.15;
          other.x -= nx * overlap * 0.5;
          other.y -= ny * overlap * 0.15;
        }
      }
    }
    // Floor
    if (coin.y > floorY) {
      coin.y = floorY;
      coin.vy *= -0.35;
      coin.vx *= 0.75;
    }
    // Continuous floor friction when sliding on the floor
    if (coin.y >= floorY - 2) {
      coin.vx *= 0.88;
      coin.vy *= 0.88;
    }
    // Settle when slow (at floor level or resting on piled coins)
    if (
      Math.abs(coin.vy) < 0.4 &&
      Math.abs(coin.vx) < 0.3 &&
      coin.y >= floorY - COIN_R * 2
    ) {
      coin.settled = true;
      coin.vx = 0;
      coin.vy = 0;
    }
  }

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

setInterval(() => update(), updateIntervalMs);
