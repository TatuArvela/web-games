// Pre-rendered triple-BAR symbol
const barCanvas = document.createElement("canvas");
(function renderBarCanvas() {
  const rows = 3;
  const bw = 480;
  const barH = 100;
  const gap = 20;
  const totalH = barH * rows + gap * (rows - 1);
  barCanvas.width = bw;
  barCanvas.height = totalH;
  const ctx = barCanvas.getContext("2d");

  ctx.font = "bold 72px Arial, sans-serif";
  const textW = ctx.measureText("BAR").width;
  const padX = 40;
  const rectW = textW + padX * 2;
  const offsetX = (bw - rectW) / 2;
  const r = 16;

  for (let b = 0; b < rows; b++) {
    const by = b * (barH + gap);

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    ctx.beginPath();
    ctx.roundRect(offsetX, by, rectW, barH, r);

    const bodyGrad = ctx.createLinearGradient(0, by, 0, by + barH);
    bodyGrad.addColorStop(0, "#3a3a3a");
    bodyGrad.addColorStop(0.15, "#1a1a1a");
    bodyGrad.addColorStop(0.85, "#111");
    bodyGrad.addColorStop(1, "#2a2a2a");
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.roundRect(offsetX, by, rectW, barH, r);
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(offsetX + 3, by + 3, rectW - 6, barH - 6, r - 2);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "bold 72px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const tx = bw / 2;
    const ty = by + barH / 2;

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillText("BAR", tx + 1, ty + 2);

    const textGrad = ctx.createLinearGradient(0, ty - 30, 0, ty + 30);
    textGrad.addColorStop(0, "#ffffff");
    textGrad.addColorStop(0.4, "#e8e8e8");
    textGrad.addColorStop(0.6, "#dddddd");
    textGrad.addColorStop(1, "#cccccc");
    ctx.fillStyle = textGrad;
    ctx.fillText("BAR", tx, ty);

    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 1;
    ctx.strokeText("BAR", tx, ty);
  }
})();

function drawTripleBar(cx, cy, w, h) {
  context.drawImage(barCanvas, cx - w / 2, cy - h / 2, w, h);
}

function drawRoundedRect(x, y, width, height, radius) {
  const o = context.lineWidth / 2;
  context.beginPath();
  context.roundRect(
    x + o,
    y + o,
    width - o * 2,
    height - o * 2,
    Math.max(0, radius - o),
  );
}

function drawSignBase() {
  const gradient = context.createLinearGradient(0, 0, 0, 200);
  gradient.addColorStop(0, "rgb(8,10,38)");
  gradient.addColorStop(0.3, "rgb(21,26,75)");
  gradient.addColorStop(0.7, "rgb(38,50,201)");
  gradient.addColorStop(1, "rgb(8,10,38)");

  context.fillStyle = gradient;
  context.fillRect(20, 10, frameWidth - 40, 180);

  context.lineWidth = 20;
  context.strokeStyle = gradient;
  drawRoundedRect(10, 0, frameWidth - 20, 200, 20);
  context.stroke();

  context.lineWidth = 20;
  context.strokeStyle = "rgb(0,0,0,0.5)";
  drawRoundedRect(10, 0, frameWidth - 20, 220, 20);
  context.stroke();

  context.lineWidth = 2;
  context.strokeStyle = "rgb(0,38,56)";
  drawRoundedRect(10, 0, frameWidth - 20, 200, 20);
  context.stroke();

  context.lineWidth = 2;
  context.strokeStyle = "rgb(31,93,119)";
  drawRoundedRect(30, 20, frameWidth - 60, 200, 10);
  context.stroke();
}

function lerpColor(c1, c2, t) {
  const a = c1.match(/\d+/g).map(Number);
  const b = c2.match(/\d+/g).map(Number);
  const m = (k) => Math.round(a[k] + (b[k] - a[k]) * t);
  return `rgb(${m(0)},${m(1)},${m(2)})`;
}

function drawSignLights() {
  const winning = state === "showing-win";
  const speed = winning ? 80 : 200;
  const time = Date.now() / speed;
  const bulbCount = 17;
  const bulbRows = [
    {
      y: 12,
      bright: "rgb(255,255,180)",
      glow: "rgba(255,255,100,0.9)",
      on: "rgb(255,255,100)",
      off: "rgb(80,80,40)",
    },
    {
      y: 188,
      bright: "rgb(255,160,160)",
      glow: "rgba(255,100,100,0.9)",
      on: "rgb(255,100,100)",
      off: "rgb(80,40,40)",
    },
  ];
  for (let i = 0; i < bulbCount; i++) {
    const x = 40 + (i / (bulbCount - 1)) * (frameWidth - 80);
    const topOn = winning
      ? Math.sin(time * 3) > 0
      : Math.sin(time + i * 0.8) > 0;
    const onStates = [topOn, winning ? topOn : !topOn];

    for (let r = 0; r < 2; r++) {
      const { y, bright, glow, on, off } = bulbRows[r];
      const isOn = onStates[r];
      context.beginPath();
      context.arc(x, y, 5, 0, Math.PI * 2);
      context.shadowBlur = 0;
      if (winning && isOn) {
        context.fillStyle = bright;
        context.shadowColor = glow;
        context.shadowBlur = 16;
      } else {
        const base = isOn ? on : off;
        // fade lit bulbs toward "off" as the machine dims
        context.fillStyle = dimLevel > 0 ? lerpColor(base, off, dimLevel) : base;
      }
      context.fill();
      context.shadowBlur = 0;
    }
  }
}

function drawLogo() {
  context.font = "70px Ultra";
  context.textAlign = "center";
  context.textBaseline = "top";

  context.lineJoin = "round";
  context.lineWidth = 10;
  context.strokeStyle = "rgb(0,38,56)";
  context.strokeText("JACKPOT", frameWidth / 2, 30);

  const gradient = context.createLinearGradient(0, 30, 0, 90);
  gradient.addColorStop(0, "rgb(236,189,93)");
  gradient.addColorStop(0.499, "rgb(236,189,93)");
  gradient.addColorStop(0.5, "rgb(210,116,58)");
  gradient.addColorStop(1, "rgb(210,116,58)");
  context.fillStyle = gradient;
  context.fillText("JACKPOT", frameWidth / 2, 30);
}

function drawTop() {
  const gradient = context.createLinearGradient(0, 100, 0, 150);
  gradient.addColorStop(0, "rgb(255,255,255)");
  gradient.addColorStop(0.15, "rgb(242,244,255)");
  gradient.addColorStop(0.35, "rgb(255,255,255)");
  gradient.addColorStop(0.55, "rgb(235,238,250)");
  gradient.addColorStop(0.75, "rgb(255,255,255)");
  gradient.addColorStop(1, "rgb(170,174,192)");

  context.fillStyle = gradient;
  context.fillRect(20, 120, frameWidth - 40, 130);

  context.lineWidth = 20;
  context.strokeStyle = gradient;
  drawRoundedRect(0, 100, frameWidth, 150, 10);
  context.stroke();

  const topEdgeGrad = context.createLinearGradient(0, 100, 0, 250);
  topEdgeGrad.addColorStop(0.0, "rgb(55, 57, 72)");
  topEdgeGrad.addColorStop(0.4, "rgb(100, 102, 118)");
  topEdgeGrad.addColorStop(0.7, "rgb(85, 87, 102)");
  topEdgeGrad.addColorStop(1.0, "rgb(50, 52, 66)");

  context.lineWidth = 3;
  context.strokeStyle = topEdgeGrad;
  drawRoundedRect(0, 100, frameWidth, 150, 10);
  context.stroke();
}

function drawWins() {
  const cardX = 25;
  const cardW = frameWidth - 50;
  const cardY = 113;
  const cardH = 82;
  const colW = cardW / 5;

  const darkGradient = context.createLinearGradient(0, 90, 0, 90 + 80);
  darkGradient.addColorStop(0, "rgb(33,31,47)");
  darkGradient.addColorStop(1, "rgb(45,54,54)");

  context.fillStyle = darkGradient;
  drawRoundedRect(cardX - 4, cardY - 4, cardW + 8, cardH + 8, 10);
  context.fill();

  context.lineWidth = 2;
  context.strokeStyle = "rgb(117,117,117)";
  drawRoundedRect(cardX - 4, cardY - 4, cardW + 8, cardH + 8, 10);
  context.stroke();

  const lightGradient = context.createLinearGradient(
    0,
    cardY,
    0,
    cardY + cardH,
  );
  lightGradient.addColorStop(0, "rgb(215, 222, 235)");
  lightGradient.addColorStop(1, "rgb(238, 243, 252)");

  context.fillStyle = lightGradient;
  drawRoundedRect(cardX, cardY, cardW, cardH, 6);
  context.fill();

  context.strokeStyle = "rgb(117,117,117)";
  context.lineWidth = 1;

  const dividerY = cardY + cardH / 2;
  context.beginPath();
  context.moveTo(cardX + 1, dividerY);
  context.lineTo(cardX + cardW - 1, dividerY);
  context.stroke();

  for (let i = 1; i < 5; i++) {
    const dx = cardX + i * colW;
    context.beginPath();
    context.moveTo(dx, cardY + 1);
    context.lineTo(dx, cardY + cardH - 1);
    context.stroke();
  }

  const rowCenters = [cardY + cardH * 0.25, cardY + cardH * 0.75];

  const entries = [
    [0, 0, "🍒", null, null, 2],
    [0, 1, "🍒", "🍒", null, 5],
    [0, 2, "🍒", "🍒", "🍒", 10],
    [0, 3, "7", "bar", "7", 15],
    [0, 4, "🔔", "🔔", "🔔", 20],

    [1, 0, "🍋", "🍋", "🍋", 5],
    [1, 1, "🍇", "🍇", "🍇", 8],
    [1, 2, "🍊", "🍊", "🍊", 10],
    [1, 3, "bar", "bar", "bar", 50],
    [1, 4, "7", "7", "7", 200],
  ];

  function drawSym(sym, x, y) {
    if (sym === null) {
      context.beginPath();
      context.arc(x, y, 4, 0, Math.PI * 2);
      context.fillStyle = "rgba(100,100,110,0.45)";
      context.fill();
    } else if (sym === "7") {
      context.save();
      context.globalAlpha = 1;
      context.font = "bold 24px Ultra";
      context.fillStyle = "#b00";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("7", x, y + 2);
      context.restore();
    } else if (sym === "bar") {
      drawTripleBar(x, y, 31, 23);
    } else {
      context.save();
      context.globalAlpha = 1;
      context.font = "20px sans-serif";
      context.fillStyle = "#000";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(sym, x, y);
      context.restore();
    }
  }

  for (const [row, col, s1, s2, s3, payout] of entries) {
    const cy = rowCenters[row];
    const colLeft = cardX + col * colW;
    const symSpacing = 26;
    const sym1X = colLeft + 20;
    const sym2X = sym1X + symSpacing;
    const sym3X = sym2X + symSpacing;

    drawSym(s1, sym1X, cy);
    drawSym(s2, sym2X, cy);
    drawSym(s3, sym3X, cy);

    context.save();
    context.globalAlpha = 1;
    context.font = "600 16px Oswald";
    context.fillStyle = "#111";
    context.textAlign = "left";
    context.textBaseline = "middle";
    context.fillText(String(payout), sym3X + 16, cy + 1);
    context.restore();
  }
}

// Right-pillar controls, stacked: coin counter (top), coin slot (middle),
// eject button (bottom). All share the same horizontal center.
const controlsX = drumsHorizontalMargin + drumsWidth + 73; // centered on the silver right pillar (visible span ~550–676)
const coinCounterX = controlsX;
const coinCounterY = topMargin + drumsVerticalMargin + 25;
const coinCounterW = 98;
const coinCounterH = 44;
const coinSlotX = controlsX;
const coinSlotY = topMargin + drumsVerticalMargin + 90; // moved down for the counter
const ejectButtonX = controlsX;
const ejectButtonY = topMargin + drumsVerticalMargin + 155;
const ejectButtonW = 70;
const ejectButtonH = 36;
const COIN_FACE_R = 15;

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

function drawDrums() {
  const gradient = context.createLinearGradient(
    0,
    drumsVerticalMargin + topMargin,
    0,
    60 + topMargin + frameHeight - drumsVerticalMargin * 2,
  );
  gradient.addColorStop(0, "rgba(0, 0, 0, 0.5)");
  gradient.addColorStop(0.2, "rgba(0, 0, 0, 0.2)");
  gradient.addColorStop(0.25, "rgba(0, 0, 0, 0.1)");
  gradient.addColorStop(0.5, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(0.8, "rgba(0, 0, 0, 0.1)");
  gradient.addColorStop(0.9, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.1)");

  const drumW = drumsWidth / 3;
  const drumAreaX = drumsHorizontalMargin;
  const drumAreaY = drumsVerticalMargin + topMargin;
  const drumAreaH = frameHeight - drumsVerticalMargin * 2;

  drums.forEach((drum, index) => {
    const dx = drumW * index + drumAreaX;

    context.fillStyle = `rgb(245, 255, 251)`;
    context.fillRect(dx, drumAreaY, drumW, drumAreaH);

    context.save();
    context.beginPath();
    context.rect(dx + 2, drumAreaY + 2, drumW - 4, drumAreaH - 4);
    context.clip();

    const symbols = drum.visibleSymbols;
    const offsetY = drum.fractionalOffset;
    const cellH = drum.symbolHeight;
    const centerY = drumAreaY + drumAreaH / 2;

    for (let s = -2; s <= 2; s++) {
      const symIdx = s + 2;
      if (symIdx >= 0 && symIdx < symbols.length) {
        const sym = symbols[symIdx];
        const sy = centerY + s * cellH - offsetY;

        if (sym.name === "seven") {
          context.font = "bold 80px Ultra";
          context.fillStyle = "#cc0000";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.letterSpacing = "4px";
          context.fillText(sym.emoji, dx + drumW / 2, sy);
          context.letterSpacing = "0px";
        } else if (sym.name === "bar") {
          drawTripleBar(dx + drumW / 2, sy, drumW * 0.82, 56);
        } else {
          context.font = "64px sans-serif";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(sym.emoji, dx + drumW / 2, sy);
        }
      }
    }

    context.restore();

    context.fillStyle = gradient;
    context.fillRect(dx, drumAreaY, drumW, drumAreaH);
  });

  if (dimLevel > 0) {
    context.fillStyle = `rgba(0, 0, 0, ${0.5 * dimLevel})`;
    context.fillRect(drumAreaX, drumAreaY, drumsWidth, drumAreaH);
  }
}

function drawFrameBack() {
  const gradient2 = context.createLinearGradient(
    0,
    50 + topMargin,
    0,
    60 + topMargin + frameHeight - 100,
  );
  gradient2.addColorStop(0, "rgb(245,245,252)");
  gradient2.addColorStop(0.8, "rgb(230,230,240)");
  gradient2.addColorStop(1, "rgb(120,120,140)");

  context.lineWidth = 20;
  context.strokeStyle = gradient2;
  drawRoundedRect(0, topMargin, frameWidth, frameHeight, 30);
  context.stroke();
  context.fillStyle = gradient2;
  context.fillRect(
    drumsHorizontalMargin / 2 - 50,
    topMargin + 10,
    drumsHorizontalMargin / 2 + 50,
    frameHeight - 20,
  );
  context.fillRect(
    frameWidth - drumsHorizontalMargin,
    topMargin + 10,
    drumsHorizontalMargin / 2 + 50,
    frameHeight - 20,
  );

  const edgeGrad = context.createLinearGradient(
    0,
    topMargin,
    0,
    topMargin + frameHeight,
  );
  edgeGrad.addColorStop(0.0, "rgb(55, 57, 72)");
  edgeGrad.addColorStop(0.25, "rgb(100, 102, 118)");
  edgeGrad.addColorStop(0.5, "rgb(75, 77, 92)");
  edgeGrad.addColorStop(0.75, "rgb(95, 97, 112)");
  edgeGrad.addColorStop(1.0, "rgb(45, 47, 62)");

  context.lineWidth = 3;
  context.strokeStyle = edgeGrad;
  drawRoundedRect(0, topMargin, frameWidth, frameHeight, 30);
  context.stroke();
}

function drawFrameFront() {
  const fL = drumsHorizontalMargin;
  const fT = drumsVerticalMargin + topMargin;
  const drumW = drumsWidth / 3;

  const chrome = context.createLinearGradient(
    0,
    fT - 20,
    0,
    fT + drumsHeight + 20,
  );
  chrome.addColorStop(0.0, "rgb(70, 72, 88)");
  chrome.addColorStop(0.08, "rgb(120, 122, 140)");
  chrome.addColorStop(0.18, "rgb(195, 197, 212)");
  chrome.addColorStop(0.3, "rgb(240, 241, 250)");
  chrome.addColorStop(0.38, "rgb(255, 255, 255)");
  chrome.addColorStop(0.46, "rgb(235, 237, 248)");
  chrome.addColorStop(0.58, "rgb(185, 187, 202)");
  chrome.addColorStop(0.72, "rgb(225, 227, 238)");
  chrome.addColorStop(0.82, "rgb(175, 177, 192)");
  chrome.addColorStop(0.92, "rgb(105, 107, 122)");
  chrome.addColorStop(1.0, "rgb(65, 67, 82)");

  context.lineWidth = 20;
  context.strokeStyle = chrome;
  drums.forEach((_, index) => {
    context.beginPath();
    context.rect(drumW * index + fL, fT, drumW, drumsHeight);
    context.closePath();
    context.stroke();
  });

  context.lineWidth = 1.5;
  context.strokeStyle = "rgba(0,0,0,0.55)";
  drawRoundedRect(fL - 10, fT - 10, drumsWidth + 20, drumsHeight + 20, 10);
  context.stroke();

  context.lineWidth = 1;
  context.strokeStyle = "rgba(255,255,255,0.25)";
  context.strokeRect(fL + 10, fT + 10, drumsWidth - 20, drumsHeight - 20);

  const shadowW = 20;
  drums.forEach((_, i) => {
    const dx = fL + drumW * i;
    context.save();
    context.beginPath();
    context.rect(dx + 10, fT + 10, drumW - 20, drumsHeight - 20);
    context.clip();

    const ls = context.createLinearGradient(dx + 10, 0, dx + 10 + shadowW, 0);
    ls.addColorStop(0, "rgba(0,0,0,0.30)");
    ls.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = ls;
    context.fillRect(dx + 10, fT + 10, shadowW, drumsHeight - 20);

    const rs = context.createLinearGradient(
      dx + drumW - 10 - shadowW,
      0,
      dx + drumW - 10,
      0,
    );
    rs.addColorStop(0, "rgba(0,0,0,0)");
    rs.addColorStop(1, "rgba(0,0,0,0.30)");
    context.fillStyle = rs;
    context.fillRect(
      dx + drumW - 10 - shadowW,
      fT + 10,
      shadowW,
      drumsHeight - 20,
    );

    context.restore();
  });
}

function drawBottom() {
  const gradient = context.createLinearGradient(
    0,
    topMargin + frameHeight - 40,
    0,
    canvas.height,
  );
  gradient.addColorStop(0, "rgb(90,90,110)");
  gradient.addColorStop(0.7, "rgb(248,248,255)");

  context.fillStyle = gradient;
  context.fillRect(
    20,
    topMargin + frameHeight - 20,
    frameWidth - 40,
    bottomMargin,
  );

  context.lineWidth = 20;
  context.strokeStyle = gradient;
  drawRoundedRect(
    0,
    topMargin + frameHeight - 40,
    frameWidth,
    bottomMargin + 40,
    10,
  );
  context.stroke();

  const bottomEdgeGrad = context.createLinearGradient(
    0,
    topMargin + frameHeight - 40,
    0,
    topMargin + frameHeight + bottomMargin,
  );
  bottomEdgeGrad.addColorStop(0.0, "rgb(55, 57, 72)");
  bottomEdgeGrad.addColorStop(0.4, "rgb(100, 102, 118)");
  bottomEdgeGrad.addColorStop(0.7, "rgb(85, 87, 102)");
  bottomEdgeGrad.addColorStop(1.0, "rgb(50, 52, 66)");

  context.lineWidth = 3;
  context.strokeStyle = bottomEdgeGrad;
  drawRoundedRect(
    0,
    topMargin + frameHeight - 40,
    frameWidth,
    bottomMargin + 40,
    10,
  );
  context.stroke();
}

function drawArmBase() {
  context.save();
  context.translate(canvas.width - 120, canvas.height / 2 - 20);

  context.lineWidth = 5;
  context.strokeStyle = "rgb(105,105,105)";
  const gradient = context.createLinearGradient(0, 0, 0, 120);
  gradient.addColorStop(0, "rgb(183,183,183)");
  gradient.addColorStop(0.2, "rgb(211,211,211)");
  gradient.addColorStop(0.8, "rgb(100,100,100)");
  context.fillStyle = gradient;

  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(40, 20);
  context.lineTo(40, 100);
  context.lineTo(0, 120);
  context.closePath();
  context.stroke();
  context.fill();

  context.restore();
}

function drawArm() {
  context.save();
  context.translate(
    canvas.width - 110,
    canvas.height / 2 - 200 + armPullOffset,
  );

  context.lineWidth = 8;
  context.strokeStyle = "rgb(105,105,105)";
  const gradient = context.createLinearGradient(0, 0, 0, 120);
  gradient.addColorStop(0, "rgb(183,183,183)");
  gradient.addColorStop(0.2, "rgb(211,211,211)");
  gradient.addColorStop(0.8, "rgb(100,100,100)");
  context.fillStyle = gradient;

  const armLength = 200 - armPullOffset * 0.6;
  context.beginPath();
  context.moveTo(55, 0);
  context.lineTo(75, 0);
  context.lineTo(20, armLength);
  context.lineTo(5, armLength - 5);
  context.closePath();
  context.stroke();
  context.fill();

  context.restore();
}

function drawArmBall() {
  context.save();
  context.translate(canvas.width - 40, canvas.height / 2 - 200 + armPullOffset);

  context.beginPath();
  context.arc(0, 0, 40, 0, Math.PI * 2);

  context.fillStyle = "rgb(140,0,0)";
  context.fill();

  const reflectionGradient1 = context.createRadialGradient(
    -20,
    -20,
    10,
    0,
    0,
    50,
  );
  reflectionGradient1.addColorStop(0, "rgba(220,40,40,0.85)");
  reflectionGradient1.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = reflectionGradient1;
  context.fill();

  const reflectionGradient2 = context.createRadialGradient(
    -10,
    -20,
    2,
    -10,
    -20,
    20,
  );
  reflectionGradient2.addColorStop(0, "rgba(255,255,255,0.9)");
  reflectionGradient2.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = reflectionGradient2;
  context.fill();

  context.restore();
}

const trayW = frameWidth - 184;
const trayX = (frameWidth - trayW) / 2; // centers the payout slot on the middle drum
const trayY = topMargin + frameHeight + bottomMargin - 85;
const trayH = 55;

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

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  drawSignBase();
  drawSignLights();
  drawLogo();

  drawTop();
  drawWins();

  drawBottom();

  drawArmBase();
  drawArm();
  drawArmBall();

  drawFrameBack();
  drawDrums();
  drawFrameFront();

  drawCoinTray();
  drawCoins();
  drawCoinCounter();
  drawEjectButton();
  drawCoinSlot();
  drawInsertingCoins();

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
