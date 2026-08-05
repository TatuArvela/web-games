// Cabinet rendering: the machine's fixed structure — sign, marquee lights,
// logo, paytable, reels, chrome frame, and the pull lever. Also holds the
// shared canvas-drawing helpers (rounded rects, BAR symbol, gradients).

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

// Brushed-metal vertical gradient for the lever arm pieces, in local (post-
// translate) coordinates spanning 0..120.
function armMetalGradient() {
  const g = context.createLinearGradient(0, 0, 0, 120);
  g.addColorStop(0, "rgb(183,183,183)");
  g.addColorStop(0.2, "rgb(211,211,211)");
  g.addColorStop(0.8, "rgb(100,100,100)");
  return g;
}

// Dark metallic edge-stroke gradient shared by the top and bottom cabinet trim.
function edgeGradient(y0, y1) {
  const g = context.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0.0, "rgb(55, 57, 72)");
  g.addColorStop(0.4, "rgb(100, 102, 118)");
  g.addColorStop(0.7, "rgb(85, 87, 102)");
  g.addColorStop(1.0, "rgb(50, 52, 66)");
  return g;
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

  context.lineWidth = 3;
  context.strokeStyle = edgeGradient(100, 250);
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

  context.lineWidth = 3;
  context.strokeStyle = edgeGradient(
    topMargin + frameHeight - 40,
    topMargin + frameHeight + bottomMargin,
  );
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
  context.translate(leverBaseX, leverBaseY);

  context.lineWidth = 5;
  context.strokeStyle = "rgb(105,105,105)";
  context.fillStyle = armMetalGradient();

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
  context.translate(leverArmX, leverTopY + armPullOffset);

  context.lineWidth = 8;
  context.strokeStyle = "rgb(105,105,105)";
  context.fillStyle = armMetalGradient();

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
  context.translate(leverBallX, leverTopY + armPullOffset);

  context.beginPath();
  context.arc(0, 0, leverBallR, 0, Math.PI * 2);

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
