const canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 600;
const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;
const updateIntervalMs = 10;

let credits = 0; // coins inserted into the machine (LCD counter, max 999)
let trayCount = 20; // physical coins sitting in the payout tray
let lastWin = 0;
let state = "idle";
let winFlashTimer = 0;
let pendingPayout = 0;
let payoutTimer = 0;
let nextCoinDelay = 120;
let coins = [];
const COIN_R = 13;

let insertingCoins = []; // coins animating into the slot
let pendingEject = 0; // credits still to return to the tray
let ejectTimer = 0;
let nextEjectDelay = 60;
let dimRaw = 1; // linear dim driver, 0..1
let dimLevel = 1; // eased value read by the renderer (0 = lit, 1 = dimmed)
let ejectDimRaw = 1; // linear driver for the eject button's own dim
let ejectDimLevel = 1; // eased dim for the eject button (dim when nothing to eject or ejecting)

let armPullOffset = 0; // 0 = resting, positive = pulled down
let armDown = false; // true while the lever is held down

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

function placeTrayCoinsImmediate() {
  coins = [];
  const count = Math.min(trayCount, 50);
  const slotCenterX = trayX + trayW / 2;
  const floorY = trayY + trayH - 10;
  const leftX = trayX + 18;
  const rightX = trayX + trayW - 18;

  for (let i = 0; i < count; i++) {
    coins.push({
      x: slotCenterX + (Math.random() - 0.5) * 30,
      y: trayY - 5 - i * COIN_R * 2.5,
      vx: (Math.random() - 0.5) * 3,
      vy: 1,
      settled: false,
    });
  }

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

  for (const coin of coins) {
    coin.settled = true;
    coin.vx = 0;
    coin.vy = 0;
  }
}

window.addEventListener("load", placeTrayCoinsImmediate);

function spawnTrayCoin() {
  if (coins.length >= 50) return;
  const slotCenterX = trayX + trayW / 2 + (Math.random() - 0.5) * 30;
  coins.push({
    x: slotCenterX,
    y: trayY - 5,
    vx: (Math.random() - 0.5) * 2,
    vy: 1,
    settled: false,
  });
}

function removeTrayVisualCoin() {
  for (let i = coins.length - 1; i >= 0; i--) {
    if (coins[i].settled) {
      coins.splice(i, 1);
      return;
    }
  }
  if (coins.length > 0) coins.pop();
}

function insertCoin() {
  if (pendingEject > 0) return;
  if (trayCount <= 0) return;
  if (credits + insertingCoins.length >= 999) return;
  audioCtx.resume();
  trayCount -= 1;
  removeTrayVisualCoin();
  insertingCoins.push({ t: 0 });
}

function ejectCoins() {
  audioCtx.resume();
  playButtonSound(); // the button always clicks, even with nothing to eject
  if (state !== "idle") return;
  if (credits <= 0 || pendingEject > 0) return;
  pendingEject = credits;
  ejectTimer = 0;
}

function pullLever() {
  if (state !== "idle") return;
  if (pendingEject > 0) return; // busy returning coins to the tray
  if (credits < 1) {
    return;
  }
  audioCtx.resume();
  credits -= 1;

  lastWin = 0;
  state = "spinning";

  drums.forEach((d) => d.spin());

  const results = drums.map((d) => {
    const idx = Math.floor(Math.random() * d.strip.length);
    return idx;
  });

  const spinDelay = 1200 + Math.random() * 400;
  drums.forEach((d, i) => {
    setTimeout(
      () => {
        d.beginStop(results[i]);
      },
      spinDelay + i * 600,
    );
  });

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

    if (credits <= 0 && trayCount <= 0) {
      playLoseSound();
    }
  }
}

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

function isInLeverRegion(x, y) {
  return x > 680 && y < canvas.height / 2;
}

function isInCoinSlotRegion(x, y) {
  return Math.abs(x - coinSlotX) < 46 && Math.abs(y - coinSlotY) < 30;
}

function isInEjectRegion(x, y) {
  return (
    Math.abs(x - ejectButtonX) < ejectButtonW / 2 &&
    Math.abs(y - ejectButtonY) < ejectButtonH / 2
  );
}

function handlePress(x, y) {
  if (isInLeverRegion(x, y)) {
    pressLever();
    return true;
  }
  if (isInCoinSlotRegion(x, y)) {
    insertCoin();
    return true;
  }
  if (isInEjectRegion(x, y)) {
    ejectCoins();
    return true;
  }
  return false;
}

function pressLever() {
  armDown = true; // lever drops while held
  audioCtx.resume();
  playLeverSound(); // the handle always clunks, even when it can't spin
  pullLever();
}

function releaseLever() {
  armDown = false; // lever springs back up
}

canvas.addEventListener("mousedown", (e) => {
  const { x, y } = getCanvasCoords(e);
  if (handlePress(x, y)) e.preventDefault();
});

window.addEventListener("mouseup", releaseLever);

canvas.addEventListener(
  "touchstart",
  (e) => {
    const { x, y } = getCanvasCoords(e);
    if (handlePress(x, y)) e.preventDefault();
  },
  { passive: false },
);

window.addEventListener("touchend", releaseLever);

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "Enter") {
    e.preventDefault();
    if (!e.repeat) pressLever();
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "Space" || e.code === "Enter") {
    e.preventDefault();
    releaseLever();
  }
});

let spinTickCounter = 0;

function update() {
  drums.forEach((d) => d.update());

  // Arm animation — follows the lever's held state
  if (armDown) {
    armPullOffset = Math.min(120, armPullOffset + 8);
  } else {
    armPullOffset = Math.max(0, armPullOffset - 4);
  }

  // Smooth machine dim/light transition (dim when no coins are inserted)
  const dimTarget = credits <= 0 && state === "idle" ? 1 : 0;
  if (dimRaw < dimTarget) {
    dimRaw = Math.min(dimTarget, dimRaw + 0.045);
  } else if (dimRaw > dimTarget) {
    dimRaw = Math.max(dimTarget, dimRaw - 0.045);
  }
  dimLevel = dimRaw * dimRaw * (3 - 2 * dimRaw); // smoothstep ease-in-out

  // Eject button is lit only when an eject is possible: idle, has credits,
  // and not already ejecting. Otherwise it dims (spinning, paying out, empty).
  const ejectDimTarget =
    credits <= 0 || pendingEject > 0 || state !== "idle" ? 1 : 0;
  if (ejectDimRaw < ejectDimTarget) {
    ejectDimRaw = Math.min(ejectDimTarget, ejectDimRaw + 0.08);
  } else if (ejectDimRaw > ejectDimTarget) {
    ejectDimRaw = Math.max(ejectDimTarget, ejectDimRaw - 0.08);
  }
  ejectDimLevel = ejectDimRaw * ejectDimRaw * (3 - 2 * ejectDimRaw);

  // Coins animating into the slot; each becomes a credit once fully inserted
  for (let i = insertingCoins.length - 1; i >= 0; i--) {
    insertingCoins[i].t += 0.05;
    if (insertingCoins[i].t >= 1) {
      insertingCoins.splice(i, 1);
      credits = Math.min(999, credits + 1);
      playInsertCoinSound();
    }
  }

  // Eject: return inserted credits to the tray, one coin at a time
  if (pendingEject > 0) {
    ejectTimer += updateIntervalMs;
    if (ejectTimer >= nextEjectDelay) {
      ejectTimer = 0;
      nextEjectDelay = 40 + Math.random() * 50;
      if (credits > 0) {
        credits -= 1;
        trayCount += 1;
        spawnTrayCoin();
        playInsertCoinSound();
        pendingEject -= 1;
      } else {
        pendingEject = 0; // nothing left to eject
      }
    }
  }

  if (state === "showing-win") {
    winFlashTimer += updateIntervalMs;
  }

  if (state === "showing-win" && pendingPayout > 0) {
    payoutTimer += updateIntervalMs;
    if (payoutTimer >= nextCoinDelay) {
      payoutTimer = 0;
      nextCoinDelay = 80 + Math.random() * 120; // 80–200ms per coin
      trayCount += 1;
      pendingPayout -= 1;
      playInsertCoinSound();
      spawnTrayCoin();
      if (pendingPayout <= 0) {
        setTimeout(() => {
          state = "idle";
        }, 600);
      }
    }
  }

  const floorY = trayY + trayH - 10;
  const leftX = trayX + 18;
  const rightX = trayX + trayW - 18;
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
