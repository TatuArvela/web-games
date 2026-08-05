// Device rendering: the interactive parts and the coins — coin slot, LCD
// credit counter, eject button, the payout tray, and every coin drawn in it.

const COIN_FACE_R = 15; // radius of the coin sliding into the slot

function drawCoinSlot() {
  const x = coinSlotX;
  const y = coinSlotY;

  const slotW = 58;
  const slotH = 32;
  const baseW = 44;
  const lipH = 7;
  const funnelDepth = 9;

  const top = y - slotH / 2;
  const bot = y + slotH / 2;

  const leftWallGrad = context.createLinearGradient(
    x - slotW / 2 - funnelDepth,
    0,
    x - slotW / 2,
    0,
  );
  leftWallGrad.addColorStop(0, "rgb(155,157,175)");
  leftWallGrad.addColorStop(1, "rgb(210,212,228)");
  context.fillStyle = leftWallGrad;
  context.beginPath();
  context.moveTo(x - slotW / 2, top);
  context.lineTo(x - baseW / 2, bot);
  context.lineTo(x - baseW / 2 - funnelDepth, bot);
  context.lineTo(x - slotW / 2 - funnelDepth, top);
  context.closePath();
  context.fill();

  const rightWallGrad = context.createLinearGradient(
    x + slotW / 2,
    0,
    x + slotW / 2 + funnelDepth,
    0,
  );
  rightWallGrad.addColorStop(0, "rgb(120,122,140)");
  rightWallGrad.addColorStop(1, "rgb(172,174,192)");
  context.fillStyle = rightWallGrad;
  context.beginPath();
  context.moveTo(x + slotW / 2, top);
  context.lineTo(x + baseW / 2, bot);
  context.lineTo(x + baseW / 2 + funnelDepth, bot);
  context.lineTo(x + slotW / 2 + funnelDepth, top);
  context.closePath();
  context.fill();

  const innerGrad = context.createLinearGradient(0, top, 0, bot);
  innerGrad.addColorStop(0, "rgb(178,180,198)");
  innerGrad.addColorStop(0.5, "rgb(138,140,158)");
  innerGrad.addColorStop(1, "rgb(95,97,115)");
  context.fillStyle = innerGrad;
  context.beginPath();
  context.moveTo(x - slotW / 2, top);
  context.lineTo(x + slotW / 2, top);
  context.lineTo(x + baseW / 2, bot);
  context.lineTo(x - baseW / 2, bot);
  context.closePath();
  context.fill();

  const slitW = baseW - 6;
  const slitH = 6;
  const slitY = bot - slitH - 2;
  context.fillStyle = "rgb(30,30,42)";
  context.beginPath();
  context.roundRect(x - slitW / 2 - 1, slitY - 1, slitW + 2, slitH + 2, 4);
  context.fill();
  context.fillStyle = "rgb(42,42,58)";
  context.beginPath();
  context.roundRect(x - slitW / 2, slitY, slitW, slitH, 3);
  context.fill();

  context.strokeStyle = "rgba(200,202,220,0.5)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(x - slitW / 2 + 4, slitY);
  context.lineTo(x + slitW / 2 - 4, slitY);
  context.stroke();

  const rimGrad = context.createLinearGradient(0, top - lipH, 0, top + 1);
  rimGrad.addColorStop(0, "rgb(225,227,243)");
  rimGrad.addColorStop(0.38, "rgb(255,255,255)");
  rimGrad.addColorStop(0.65, "rgb(210,212,228)");
  rimGrad.addColorStop(1, "rgb(155,157,175)");
  context.fillStyle = rimGrad;
  context.beginPath();
  context.roundRect(
    x - slotW / 2 - funnelDepth - 1,
    top - lipH,
    slotW + funnelDepth * 2 + 2,
    lipH + 1,
    [4, 4, 0, 0],
  );
  context.fill();

  context.strokeStyle = "rgba(255,255,255,0.7)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(x - slotW / 2 - funnelDepth + 2, top - lipH + 1);
  context.lineTo(x + slotW / 2 + funnelDepth - 2, top - lipH + 1);
  context.stroke();

  context.strokeStyle = "rgba(60,62,78,0.6)";
  context.lineWidth = 0.75;
  context.beginPath();
  context.moveTo(x - slotW / 2, top);
  context.lineTo(x - baseW / 2, bot);
  context.stroke();
  context.beginPath();
  context.moveTo(x + slotW / 2, top);
  context.lineTo(x + baseW / 2, bot);
  context.stroke();

  context.strokeStyle = "rgb(72,74,90)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(x - slotW / 2 - funnelDepth, top - lipH);
  context.lineTo(x + slotW / 2 + funnelDepth, top - lipH);
  context.lineTo(x + baseW / 2 + funnelDepth, bot);
  context.lineTo(x - baseW / 2 - funnelDepth, bot);
  context.closePath();
  context.stroke();
}

// Seven-segment digit definitions
const SEVEN_SEG = {
  0: "abcdef",
  1: "bc",
  2: "abged",
  3: "abgcd",
  4: "fgbc",
  5: "afgcd",
  6: "afgedc",
  7: "abc",
  8: "abcdefg",
  9: "abcdfg",
};

function drawSevenSeg(digit, dx, dy, w, h, t) {
  const on = digit === null ? "" : SEVEN_SEG[digit];
  const onColor = "rgb(38,58,30)";
  const offColor = "rgba(70,95,55,0.22)";
  const half = (h - t) / 2;
  const hlen = w - t * 1.4;
  const vlen = half - t * 0.9;

  function seg(name, cx, cy, len, horizontal) {
    context.beginPath();
    if (horizontal) {
      context.roundRect(cx - len / 2, cy - t / 2, len, t, t / 2);
    } else {
      context.roundRect(cx - t / 2, cy - len / 2, t, len, t / 2);
    }
    context.fillStyle = on.includes(name) ? onColor : offColor;
    context.fill();
  }

  const midX = dx + w / 2;
  seg("a", midX, dy + t / 2, hlen, true);
  seg("g", midX, dy + h / 2, hlen, true);
  seg("d", midX, dy + h - t / 2, hlen, true);
  seg("f", dx + t / 2, dy + t / 2 + half / 2, vlen, false);
  seg("b", dx + w - t / 2, dy + t / 2 + half / 2, vlen, false);
  seg("e", dx + t / 2, dy + h / 2 + half / 2, vlen, false);
  seg("c", dx + w - t / 2, dy + h / 2 + half / 2, vlen, false);
}

function drawCoinCounter() {
  const w = coinCounterW;
  const h = coinCounterH;
  const x = coinCounterX - w / 2;
  const y = coinCounterY - h / 2;

  const bezel = context.createLinearGradient(0, y, 0, y + h);
  bezel.addColorStop(0, "rgb(122,138,108)");
  bezel.addColorStop(0.5, "rgb(84,98,72)");
  bezel.addColorStop(1, "rgb(58,70,50)");
  context.fillStyle = bezel;
  context.beginPath();
  context.roundRect(x, y, w, h, 8);
  context.fill();
  context.lineWidth = 1.5;
  context.strokeStyle = "rgba(0,0,0,0.55)";
  context.stroke();

  const pad = 6;
  const sx = x + pad;
  const sy = y + pad;
  const sw = w - pad * 2;
  const sh = h - pad * 2;

  const screen = context.createLinearGradient(0, sy, 0, sy + sh);
  screen.addColorStop(0, "rgb(156,184,124)");
  screen.addColorStop(1, "rgb(128,158,100)");
  context.fillStyle = screen;
  context.beginPath();
  context.roundRect(sx, sy, sw, sh, 4);
  context.fill();

  const inner = context.createLinearGradient(0, sy, 0, sy + 8);
  inner.addColorStop(0, "rgba(0,0,0,0.28)");
  inner.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = inner;
  context.beginPath();
  context.roundRect(sx, sy, sw, 8, [4, 4, 0, 0]);
  context.fill();

  const value = Math.min(999, Math.max(0, Math.floor(credits)));
  const str = String(value).padStart(3, " ");
  const digitW = 17;
  const gap = 5;
  const thick = 4;
  const digitH = sh - 10;
  const totalW = digitW * 3 + gap * 2;
  let dx = sx + sw - totalW - 6; // right-aligned with a small margin
  const dy = sy + (sh - digitH) / 2;
  for (let i = 0; i < 3; i++) {
    const ch = str[i];
    drawSevenSeg(ch === " " ? null : Number(ch), dx, dy, digitW, digitH, thick);
    dx += digitW + gap;
  }
}

function drawEjectButton() {
  const w = ejectButtonW;
  const h = ejectButtonH;
  const x = ejectButtonX - w / 2;
  const y = ejectButtonY - h / 2;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const housing = context.createLinearGradient(0, y - 3, 0, y + h + 3);
  housing.addColorStop(0, "rgb(44,44,50)");
  housing.addColorStop(1, "rgb(18,18,22)");
  context.fillStyle = housing;
  context.beginPath();
  context.roundRect(x - 3, y - 3, w + 6, h + 6, 9);
  context.fill();
  context.lineWidth = 1.5;
  context.strokeStyle = "rgba(0,0,0,0.6)";
  context.stroke();

  const glow = context.createRadialGradient(cx, cy - 4, 4, cx, cy, w * 0.72);
  glow.addColorStop(0, "rgb(255,112,72)");
  glow.addColorStop(0.45, "rgb(200,42,26)");
  glow.addColorStop(1, "rgb(108,16,10)");
  context.fillStyle = glow;
  context.beginPath();
  context.roundRect(x, y, w, h, 6);
  context.fill();

  const gloss = context.createLinearGradient(0, y, 0, y + h * 0.5);
  gloss.addColorStop(0, "rgba(255,255,255,0.35)");
  gloss.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gloss;
  context.beginPath();
  context.roundRect(x + 3, y + 2, w - 6, h * 0.45, [5, 5, 8, 8]);
  context.fill();

  context.lineWidth = 1;
  context.strokeStyle = "rgba(255,180,150,0.5)";
  context.beginPath();
  context.roundRect(x + 0.5, y + 0.5, w - 1, h - 1, 6);
  context.stroke();

  context.save();
  context.fillStyle = "rgba(58,10,6,0.9)";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "bold 12px Oswald, sans-serif";
  context.shadowColor = "rgba(255,200,180,0.5)";
  context.shadowBlur = 1.5;
  context.fillText("PUSH TO", cx, cy - 7);
  context.fillText("EJECT", cx, cy + 7);
  context.restore();

  // Smooth dim while there are no coins to eject or an eject is in progress
  if (ejectDimLevel > 0) {
    context.save();
    context.beginPath();
    context.roundRect(x, y, w, h, 6);
    context.clip();
    context.fillStyle = `rgba(12,6,5,${0.6 * ejectDimLevel})`;
    context.fillRect(x, y, w, h);
    context.restore();
  }
}

function drawCoinFace(cx, cy, r, alpha) {
  context.save();
  context.globalAlpha = alpha;
  const grad = context.createRadialGradient(
    cx - r * 0.35,
    cy - r * 0.35,
    r * 0.1,
    cx,
    cy,
    r,
  );
  grad.addColorStop(0, "rgb(255,244,170)");
  grad.addColorStop(0.5, "rgb(240,200,60)");
  grad.addColorStop(1, "rgb(175,135,25)");
  context.beginPath();
  context.arc(cx, cy, r, 0, Math.PI * 2);
  context.fillStyle = grad;
  context.fill();
  context.lineWidth = 1.5;
  context.strokeStyle = "rgba(120,90,10,0.7)";
  context.stroke();
  context.beginPath();
  context.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
  context.strokeStyle = "rgba(150,110,15,0.55)";
  context.lineWidth = 1;
  context.stroke();
  context.beginPath();
  context.ellipse(cx - r * 0.32, cy - r * 0.36, r * 0.3, r * 0.16, -0.5, 0, Math.PI * 2);
  context.fillStyle = "rgba(255,255,235,0.6)";
  context.fill();
  context.restore();
}

function drawInsertingCoins() {
  const startY = coinSlotY - 26; // just above the slot mouth
  const endY = coinSlotY + 12; // down into the slit
  for (const c of insertingCoins) {
    const t = c.t;
    const drop = Math.pow(t, 1.3); // accelerate downward as it slides in
    const cy = startY + (endY - startY) * drop;
    let r = COIN_FACE_R;
    let alpha = 1;
    if (t > 0.6) {
      const p = (t - 0.6) / 0.4;
      r *= 1 - 0.5 * p;
      alpha = 1 - p;
    }
    drawCoinFace(coinSlotX, cy, r, alpha);
  }
}

function drawCoinTray() {
  const wallW = 7;
  const rimH = 10;
  const lipH = 13;
  const r = 7;

  context.fillStyle = "rgb(70,72,88)";
  context.beginPath();
  context.roundRect(
    trayX - wallW - 2,
    trayY - rimH - 2,
    trayW + (wallW + 2) * 2,
    trayH + rimH + lipH + 4,
    9,
  );
  context.fill();

  const leftWallGrad = context.createLinearGradient(trayX - wallW, 0, trayX, 0);
  leftWallGrad.addColorStop(0, "rgb(155,157,173)");
  leftWallGrad.addColorStop(0.4, "rgb(210,212,228)");
  leftWallGrad.addColorStop(1, "rgb(125,127,143)");
  context.fillStyle = leftWallGrad;
  context.beginPath();
  context.roundRect(
    trayX - wallW,
    trayY - rimH,
    wallW,
    trayH + rimH + lipH,
    [4, 0, 0, 5],
  );
  context.fill();

  const rightWallGrad = context.createLinearGradient(
    trayX + trayW,
    0,
    trayX + trayW + wallW,
    0,
  );
  rightWallGrad.addColorStop(0, "rgb(118,120,136)");
  rightWallGrad.addColorStop(0.6, "rgb(195,197,213)");
  rightWallGrad.addColorStop(1, "rgb(148,150,166)");
  context.fillStyle = rightWallGrad;
  context.beginPath();
  context.roundRect(
    trayX + trayW,
    trayY - rimH,
    wallW,
    trayH + rimH + lipH,
    [0, 4, 5, 0],
  );
  context.fill();

  const rimGrad = context.createLinearGradient(0, trayY - rimH, 0, trayY);
  rimGrad.addColorStop(0, "rgb(215,217,233)");
  rimGrad.addColorStop(0.35, "rgb(252,254,255)");
  rimGrad.addColorStop(0.65, "rgb(212,214,230)");
  rimGrad.addColorStop(1, "rgb(138,140,156)");
  context.fillStyle = rimGrad;
  context.beginPath();
  context.roundRect(
    trayX - wallW,
    trayY - rimH,
    trayW + wallW * 2,
    rimH,
    [5, 5, 0, 0],
  );
  context.fill();

  const interiorGrad = context.createLinearGradient(0, trayY, 0, trayY + trayH);
  interiorGrad.addColorStop(0, "rgb(48,48,62)");
  interiorGrad.addColorStop(0.35, "rgb(64,64,78)");
  interiorGrad.addColorStop(1, "rgb(74,74,88)");
  context.fillStyle = interiorGrad;
  context.beginPath();
  context.roundRect(trayX, trayY, trayW, trayH, [0, 0, r, r]);
  context.fill();

  const topShadow = context.createLinearGradient(0, trayY, 0, trayY + 26);
  topShadow.addColorStop(0, "rgba(0,0,0,0.55)");
  topShadow.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = topShadow;
  context.beginPath();
  context.roundRect(trayX, trayY, trayW, 26, [0, 0, 0, 0]);
  context.fill();

  const leftShadow = context.createLinearGradient(trayX, 0, trayX + 22, 0);
  leftShadow.addColorStop(0, "rgba(0,0,0,0.25)");
  leftShadow.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = leftShadow;
  context.beginPath();
  context.roundRect(trayX, trayY, 22, trayH, [0, 0, 0, r]);
  context.fill();

  const rightShadow = context.createLinearGradient(
    trayX + trayW - 22,
    0,
    trayX + trayW,
    0,
  );
  rightShadow.addColorStop(0, "rgba(0,0,0,0)");
  rightShadow.addColorStop(1, "rgba(0,0,0,0.25)");
  context.fillStyle = rightShadow;
  context.beginPath();
  context.roundRect(trayX + trayW - 22, trayY, 22, trayH, [0, 0, r, 0]);
  context.fill();

  const lipGrad = context.createLinearGradient(
    0,
    trayY + trayH,
    0,
    trayY + trayH + lipH,
  );
  lipGrad.addColorStop(0, "rgb(88,90,106)");
  lipGrad.addColorStop(0.15, "rgb(162,164,180)");
  lipGrad.addColorStop(0.38, "rgb(235,237,250)");
  lipGrad.addColorStop(0.52, "rgb(255,255,255)");
  lipGrad.addColorStop(0.68, "rgb(220,222,236)");
  lipGrad.addColorStop(0.88, "rgb(148,150,165)");
  lipGrad.addColorStop(1, "rgb(76,78,93)");
  context.fillStyle = lipGrad;
  context.beginPath();
  context.roundRect(
    trayX - wallW,
    trayY + trayH,
    trayW + wallW * 2,
    lipH,
    [0, 0, 7, 7],
  );
  context.fill();

  const slotW = 100;
  const slotH = 9;
  const slotX = trayX + trayW / 2 - slotW / 2;
  const slotY = trayY - slotH + 3;

  context.fillStyle = "rgb(30,30,42)";
  context.beginPath();
  context.roundRect(slotX - 2, slotY - 2, slotW + 4, slotH + 4, 5);
  context.fill();

  context.fillStyle = "rgb(30,30,42)";
  context.beginPath();
  context.roundRect(slotX, slotY, slotW, slotH, 4);
  context.fill();
}

function drawCoin(cx, cy, bright) {
  const rX = 17;
  const rY = 7;
  const thickness = 4;

  const edgeGrad = context.createLinearGradient(cx - rX, 0, cx + rX, 0);
  edgeGrad.addColorStop(0, "rgb(140,105,10)");
  edgeGrad.addColorStop(0.5, "rgb(180,140,25)");
  edgeGrad.addColorStop(1, "rgb(120,90,8)");
  context.beginPath();
  context.ellipse(cx, cy + thickness, rX, rY, 0, 0, Math.PI * 2);
  context.fillStyle = edgeGrad;
  context.fill();

  const faceGrad = context.createLinearGradient(cx, cy - rY, cx, cy + rY);
  if (bright) {
    faceGrad.addColorStop(0, "rgb(255,235,100)");
    faceGrad.addColorStop(0.4, "rgb(245,210,60)");
    faceGrad.addColorStop(1, "rgb(200,160,30)");
  } else {
    faceGrad.addColorStop(0, "rgb(255,225,80)");
    faceGrad.addColorStop(0.4, "rgb(235,195,45)");
    faceGrad.addColorStop(1, "rgb(190,148,25)");
  }
  context.beginPath();
  context.ellipse(cx, cy, rX, rY, 0, 0, Math.PI * 2);
  context.fillStyle = faceGrad;
  context.fill();
  context.strokeStyle = "rgba(120,90,10,0.5)";
  context.lineWidth = 0.5;
  context.stroke();

  context.beginPath();
  context.ellipse(cx, cy, rX - 4, rY - 2, 0, 0, Math.PI * 2);
  context.strokeStyle = "rgba(160,120,15,0.4)";
  context.lineWidth = 0.5;
  context.stroke();

  context.beginPath();
  context.ellipse(cx - 2, cy - 2, 6, 2.5, -0.3, 0, Math.PI * 2);
  context.fillStyle = "rgba(255,255,220,0.35)";
  context.fill();
}

function drawCoins() {
  if (coins.length === 0) return;

  for (const coin of coins) {
    if (coin.settled) drawCoin(coin.x, coin.y, false);
  }
  for (const coin of coins) {
    if (!coin.settled) drawCoin(coin.x, coin.y, true);
  }
}
