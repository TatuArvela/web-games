// ── Drawing helpers ──────────────────────────────────────

// Pre-rendered triple-BAR symbol on offscreen canvas (4x for crisp scaling)
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
  const r = 16; // corner radius

  for (let b = 0; b < rows; b++) {
    const by = b * (barH + gap);

    // Shadow
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    // Main bar shape with rounded corners
    ctx.beginPath();
    ctx.roundRect(offsetX, by, rectW, barH, r);

    // Body gradient (dark with a slight sheen)
    const bodyGrad = ctx.createLinearGradient(0, by, 0, by + barH);
    bodyGrad.addColorStop(0, "#3a3a3a");
    bodyGrad.addColorStop(0.15, "#1a1a1a");
    bodyGrad.addColorStop(0.85, "#111");
    bodyGrad.addColorStop(1, "#2a2a2a");
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.restore();

    // Border
    ctx.beginPath();
    ctx.roundRect(offsetX, by, rectW, barH, r);
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner highlight line near top
    ctx.beginPath();
    ctx.roundRect(offsetX + 3, by + 3, rectW - 6, barH - 6, r - 2);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // "BAR" text with metallic gold gradient
    ctx.font = "bold 72px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const tx = bw / 2;
    const ty = by + barH / 2;

    // Text shadow
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillText("BAR", tx + 1, ty + 2);

    // White text gradient
    const textGrad = ctx.createLinearGradient(0, ty - 30, 0, ty + 30);
    textGrad.addColorStop(0, "#ffffff");
    textGrad.addColorStop(0.4, "#e8e8e8");
    textGrad.addColorStop(0.6, "#dddddd");
    textGrad.addColorStop(1, "#cccccc");
    ctx.fillStyle = textGrad;
    ctx.fillText("BAR", tx, ty);

    // Text outline for definition
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 1;
    ctx.strokeText("BAR", tx, ty);
  }
})();

// Draw pre-rendered BAR symbol scaled to fit (cx, cy = center, w, h = target size)
function drawTripleBar(cx, cy, w, h) {
  context.drawImage(barCanvas, cx - w / 2, cy - h / 2, w, h);
}

function drawRoundedRect(x, y, width, height, radius) {
  const offset = context.lineWidth / 2;
  const adjustedRadius = radius - offset;

  context.beginPath();
  context.moveTo(x + adjustedRadius + offset, y + offset);
  context.arcTo(
    x + width - offset,
    y + offset,
    x + width - offset,
    y + height - offset,
    adjustedRadius,
  );
  context.arcTo(
    x + width - offset,
    y + height - offset,
    x + offset,
    y + height - offset,
    adjustedRadius,
  );
  context.arcTo(
    x + offset,
    y + height - offset,
    x + offset,
    y + offset,
    adjustedRadius,
  );
  context.arcTo(
    x + offset,
    y + offset,
    x + width - offset,
    y + offset,
    adjustedRadius,
  );
  context.closePath();
}

// ── Sign / logo ──────────────────────────────────────────
function drawSignBase() {
  const gradient = context.createLinearGradient(0, 0, 0, 200);
  gradient.addColorStop(0, "rgb(8,10,38)");
  gradient.addColorStop(0.3, "rgb(21,26,75)");
  gradient.addColorStop(0.7, "rgb(38,50,201)");
  gradient.addColorStop(1, "rgb(8,10,38)");

  context.fillStyle = gradient;
  context.beginPath();
  context.fillRect(20, 10, frameWidth - 40, 180);
  context.closePath();
  context.stroke();

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

function drawSignLights() {
  const broke = credits <= 0 && state === "idle";
  const winning = state === "showing-win";
  const speed = winning ? 80 : 200;
  const time = Date.now() / speed;
  const bulbCount = 17;
  for (let i = 0; i < bulbCount; i++) {
    const t = i / (bulbCount - 1);
    const x = 40 + t * (frameWidth - 80);

    let topOn, botOn;
    if (broke) {
      // All lights off when no credits
      topOn = false;
      botOn = false;
    } else if (winning) {
      // All bulbs pulse on/off together
      const allOn = Math.sin(time * 3) > 0;
      topOn = allOn;
      botOn = allOn;
    } else {
      topOn = Math.sin(time + i * 0.8) > 0;
      botOn = !topOn;
    }

    // Top row
    context.beginPath();
    context.arc(x, 12, 5, 0, Math.PI * 2);
    if (winning && topOn) {
      context.fillStyle = "rgb(255,255,180)";
      context.shadowColor = "rgba(255,255,100,0.9)";
      context.shadowBlur = 16;
    } else {
      context.fillStyle = topOn ? "rgb(255,255,100)" : "rgb(80,80,40)";
      context.shadowColor = "transparent";
      context.shadowBlur = 0;
    }
    context.fill();
    context.shadowBlur = 0;

    // Bottom row
    context.beginPath();
    context.arc(x, 188, 5, 0, Math.PI * 2);
    if (winning && botOn) {
      context.fillStyle = "rgb(255,160,160)";
      context.shadowColor = "rgba(255,100,100,0.9)";
      context.shadowBlur = 16;
    } else {
      context.fillStyle = botOn ? "rgb(255,100,100)" : "rgb(80,40,40)";
      context.shadowColor = "transparent";
      context.shadowBlur = 0;
    }
    context.fill();
    context.shadowBlur = 0;
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
  gradient.addColorStop(0, "rgb(255,227,120)");
  gradient.addColorStop(0.499, "rgb(255,227,120)");
  gradient.addColorStop(0.5, "rgb(210,160,50)");
  gradient.addColorStop(1, "rgb(210,160,50)");
  context.fillStyle = gradient;
  context.fillText("JACKPOT", frameWidth / 2, 30);
}

// ── Top section ──────────────────────────────────────────
function drawTop() {
  const gradient = context.createLinearGradient(0, 100, 0, 150);
  gradient.addColorStop(0, "rgb(245,245,250)");
  gradient.addColorStop(1, "rgb(160,160,175)");

  context.fillStyle = gradient;
  context.beginPath();
  context.fillRect(20, 120, frameWidth - 40, 130);
  context.closePath();
  context.stroke();

  context.lineWidth = 20;
  context.strokeStyle = gradient;
  drawRoundedRect(0, 100, frameWidth, 150, 10);
  context.stroke();

  context.lineWidth = 5;
  context.strokeStyle = "#888890";
  drawRoundedRect(0, 100, frameWidth, 150, 10);
  context.stroke();
}

function drawWinsText() {
  context.font = "28px Ultra";
  context.textAlign = "center";
  context.textBaseline = "top";

  context.lineJoin = "round";
  context.lineWidth = 4;
  context.strokeStyle = "rgb(27,29,30)";
  context.strokeText("WINS", 340, 113);

  const gradient = context.createLinearGradient(0, 113, 0, 143);
  gradient.addColorStop(0, "rgb(236,189,93)");
  gradient.addColorStop(0.499, "rgb(236,189,93)");
  gradient.addColorStop(0.5, "rgb(210,116,58)");
  gradient.addColorStop(1, "rgb(210,116,58)");
  context.fillStyle = gradient;
  context.fillText("WINS", 340, 113);
}

function drawWins() {
  const cardX = 25;
  const cardW = frameWidth - 50;
  const cardY = 115;
  const cardH = 74;

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
  lightGradient.addColorStop(0, "rgb(225, 220, 210)");
  lightGradient.addColorStop(1, "rgb(250, 245, 235)");

  context.fillStyle = lightGradient;
  drawRoundedRect(cardX, cardY, cardW, cardH, 6);
  context.fill();

  // Horizontal dividers
  const lineX1 = cardX + 1;
  const lineX2 = cardX + cardW - 1;
  context.strokeStyle = "rgb(117,117,117)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(lineX1, 139);
  context.lineTo(lineX2, 139);
  context.stroke();

  context.beginPath();
  context.moveTo(lineX1, 164);
  context.lineTo(lineX2, 164);
  context.stroke();

  // Row centers
  const row1 = 128; // top
  const row2 = 152; // middle
  const row3 = 176; // bottom

  // Helper: draw "7" symbol
  function draw7(x, y, size) {
    context.save();
    context.font = "bold " + size + "px Ultra";
    context.fillStyle = "#b00";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("7", x, y);
    context.restore();
  }

  // Helper: draw classic triple-BAR at a position
  function drawBarSym(x, y, w, h) {
    context.save();
    drawTripleBar(x, y, w, h);
    context.restore();
  }

  const symSize = 22;
  const barW = 37;
  const barH = 17;
  const spacing = 30;
  const centerX = cardX + cardW / 2;

  // Left side combos (7-leading)
  const leftX = cardX + 42;

  // 7 BAR BAR
  draw7(leftX - spacing, row1, symSize);
  drawBarSym(leftX, row1, barW, barH);
  drawBarSym(leftX + spacing, row1, barW, barH);

  // 7 7 BAR
  draw7(leftX - spacing, row2, symSize);
  draw7(leftX, row2, symSize);
  drawBarSym(leftX + spacing, row2, barW, barH);

  // 7 BAR 7
  draw7(leftX - spacing, row3, symSize);
  drawBarSym(leftX, row3, barW, barH);
  draw7(leftX + spacing, row3, symSize);

  // Right side combos (BAR-leading)
  const rightX = cardX + cardW - 42;

  // BAR BAR 7
  drawBarSym(rightX - spacing, row1, barW, barH);
  drawBarSym(rightX, row1, barW, barH);
  draw7(rightX + spacing, row1, symSize);

  // BAR 7 7
  drawBarSym(rightX - spacing, row2, barW, barH);
  draw7(rightX, row2, symSize);
  draw7(rightX + spacing, row2, symSize);

  // BAR 7 BAR
  drawBarSym(rightX - spacing, row3, barW, barH);
  draw7(rightX, row3, symSize);
  drawBarSym(rightX + spacing, row3, barW, barH);

  // Center boxes - 3 tall boxes spanning row2 and row3, with 7 on top and BAR on bottom
  const boxW = 40;
  const boxGap = 4;
  const centerGroupW = boxW * 3 + boxGap * 2;
  const centerStartX = centerX - centerGroupW / 2;
  const boxTop = row2 - 10 - 2;
  const boxBottom = row3 + 10 + 2;
  const boxFullH = boxBottom - boxTop;

  context.fillStyle = "rgb(73,73,73)";
  context.fillRect(
    centerStartX - 2,
    boxTop - 1,
    centerGroupW + 4,
    boxFullH + 2,
  );

  const emphasisGradient = context.createLinearGradient(
    0,
    boxTop,
    0,
    boxBottom,
  );
  emphasisGradient.addColorStop(0, "rgb(225, 220, 210)");
  emphasisGradient.addColorStop(0.5, "rgb(250, 245, 235)");
  emphasisGradient.addColorStop(1, "rgb(225, 220, 210)");

  for (let i = 0; i < 3; i++) {
    const bx = centerStartX + i * (boxW + boxGap);
    context.fillStyle = emphasisGradient;
    drawRoundedRect(bx, boxTop, boxW, boxFullH, 2);
    context.fill();
  }

  // 7s in top half (same size as side 7s)
  context.font = "bold " + symSize + "px Ultra";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#b00";
  for (let i = 0; i < 3; i++) {
    context.fillText("7", centerStartX + boxW / 2 + i * (boxW + boxGap), row2);
  }

  // BAR labels in bottom half
  for (let i = 0; i < 3; i++) {
    drawBarSym(centerStartX + boxW / 2 + i * (boxW + boxGap), row3, barW, barH);
  }
}

function drawCoinSlot() {
  const x = trayX + trayW + 39;
  const y = trayY + trayH / 2 - 16;
  const plateW = 52;
  const plateH = 36;

  // Silver plate (rounded rectangle)
  const gradient = context.createLinearGradient(
    0,
    y - plateH / 2,
    0,
    y + plateH / 2,
  );
  gradient.addColorStop(0, "rgb(252, 252, 255)");
  gradient.addColorStop(1, "rgb(110, 110, 120)");

  context.fillStyle = gradient;
  context.lineWidth = 1;
  drawRoundedRect(x - plateW / 2, y - plateH / 2, plateW, plateH, 8);
  context.fill();

  context.lineWidth = 3;
  context.strokeStyle = "rgba(0,0,0,0.2)";
  drawRoundedRect(x - plateW / 2, y - plateH / 2, plateW, plateH, 8);
  context.stroke();

  // Coin slit
  context.lineWidth = 2;
  context.strokeStyle = "rgb(0,0,0)";
  context.fillStyle = "rgb(10,10,10)";
  drawRoundedRect(x - 18, y - 3, 36, 6, 3);
  context.fill();
  context.stroke();
}

// ── Drums ────────────────────────────────────────────────
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

    // White background
    context.fillStyle = `rgb(245, 255, 251)`;
    context.fillRect(dx, drumAreaY, drumW, drumAreaH);

    // Draw symbols with clipping
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

        // Symbol
        if (sym.name === "seven") {
          context.font = "bold 80px Ultra";
          context.fillStyle = "#cc0000";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.letterSpacing = "4px";
          context.fillText(sym.emoji, dx + drumW / 2, sy);
          context.letterSpacing = "0px";
        } else if (sym.name === "bar") {
          // Classic triple-BAR
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

    // Shading overlay
    context.fillStyle = gradient;
    context.fillRect(dx, drumAreaY, drumW, drumAreaH);
  });

  // Darken drums when broke
  if (credits <= 0 && state === "idle") {
    context.fillStyle = "rgba(0, 0, 0, 0.5)";
    context.fillRect(drumAreaX, drumAreaY, drumsWidth, drumAreaH);
  }
}

function drawFrame() {
  const gradient1 = context.createLinearGradient(
    0,
    50 + topMargin,
    0,
    60 + topMargin + frameHeight - 100,
  );
  gradient1.addColorStop(0, "rgb(120,120,140)");
  gradient1.addColorStop(0.3, "rgb(240,240,250)");
  gradient1.addColorStop(1, "rgb(130,130,150)");

  context.lineWidth = 20;
  context.strokeStyle = gradient1;
  drums.forEach((drum, index) => {
    context.beginPath();
    context.rect(
      (drumsWidth / 3) * index + drumsHorizontalMargin,
      drumsVerticalMargin + topMargin,
      drumsWidth / 3,
      frameHeight - drumsVerticalMargin * 2,
    );
    context.closePath();
    context.stroke();
  });

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
    drumsHorizontalMargin / 2 + 40,
    frameHeight - 20,
  );
  context.fillRect(
    frameWidth - drumsHorizontalMargin + 10,
    topMargin + 10,
    drumsHorizontalMargin / 2 + 40,
    frameHeight - 20,
  );

  const gradient3 = context.createLinearGradient(
    0,
    50 + topMargin,
    0,
    60 + topMargin + frameHeight - 100,
  );
  gradient3.addColorStop(0, "rgb(100,100,120)");
  gradient3.addColorStop(0.3, "rgb(240,240,252)");
  gradient3.addColorStop(1, "rgb(90,90,110)");

  context.lineWidth = 10;
  context.strokeStyle = gradient3;
  drawRoundedRect(
    drumsHorizontalMargin - context.lineWidth,
    drumsVerticalMargin + topMargin - context.lineWidth,
    drumsWidth + context.lineWidth * 2,
    drumsHeight + context.lineWidth * 2,
    10,
  );
  context.stroke();

  context.lineWidth = 5;
  context.strokeStyle = "#888890";
  drawRoundedRect(0, topMargin, frameWidth, frameHeight, 30);
  context.stroke();
}

// ── Bottom ───────────────────────────────────────────────
function drawBottom() {
  const gradient = context.createLinearGradient(
    0,
    topMargin + frameHeight - 40,
    0,
    canvas.height,
  );
  gradient.addColorStop(0, "rgb(90,90,110)");
  gradient.addColorStop(0.7, "rgb(240,240,252)");

  context.fillStyle = gradient;
  context.beginPath();
  context.fillRect(
    20,
    topMargin + frameHeight - 20,
    frameWidth - 40,
    bottomMargin,
  );
  context.closePath();
  context.stroke();

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

  context.lineWidth = 5;
  context.strokeStyle = "#707078";
  drawRoundedRect(
    0,
    topMargin + frameHeight - 40,
    frameWidth,
    bottomMargin + 40,
    10,
  );
  context.stroke();
}

function drawPrizeSlot() {
  // Now drawn as part of the coin tray
}

// ── Arm (with pull animation) ────────────────────────────
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

  const arm = [
    [0, 0],
    [40, 20],
    [40, 100],
    [0, 120],
  ];
  context.beginPath();
  context.moveTo(arm[0], arm[1]);
  for (let item = 0; item < arm.length; item += 1) {
    context.lineTo(arm[item][0], arm[item][1]);
  }
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
  const base = [
    [55, 0],
    [75, 0],
    [20, armLength],
    [5, armLength - 5],
  ];
  context.beginPath();
  context.moveTo(base[0][0], base[0][1]);
  for (let item = 0; item < base.length; item += 1) {
    context.lineTo(base[item][0], base[item][1]);
  }
  context.closePath();
  context.stroke();
  context.fill();

  context.restore();
}

function drawArmBall() {
  context.save();
  context.translate(canvas.width - 40, canvas.height / 2 - 200 + armPullOffset);

  context.beginPath();
  context.arc(0, 0, 40, 0, Math.PI * 2, false);
  context.fillStyle = "rgb(152,0,0)";
  context.fill();

  const reflectionGradient1 = context.createRadialGradient(
    -20,
    -20,
    10,
    0,
    0,
    50,
  );
  reflectionGradient1.addColorStop(0, "rgba(255,62,62,0.8)");
  reflectionGradient1.addColorStop(1, "rgba(255, 255, 255, 0)");
  context.fillStyle = reflectionGradient1;
  context.beginPath();
  context.arc(0, 0, 40, 0, Math.PI * 2, false);
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
  reflectionGradient2.addColorStop(1, "rgba(255, 255, 255, 0)");
  context.fillStyle = reflectionGradient2;
  context.beginPath();
  context.arc(0, 0, 40, 0, Math.PI * 2, false);
  context.fill();

  context.restore();
}

// ── Win overlay (now handled by sign lights) ────────────
function drawWinOverlay() {
  // Win signaling moved to drawSignLights
}

// ── Coin tray & coins ────────────────────────────────────
const trayX = 30;
const trayY = topMargin + frameHeight + bottomMargin - 85;
const trayW = frameWidth - 120;
const trayH = 55;

function drawCoinTray() {
  // Tray back wall
  const backGrad = context.createLinearGradient(0, trayY - 5, 0, trayY + 8);
  backGrad.addColorStop(0, "rgb(190,190,205)");
  backGrad.addColorStop(1, "rgb(100,100,118)");
  context.fillStyle = backGrad;
  context.fillRect(trayX, trayY - 5, trayW, 10);

  // Tray bottom
  const bottomGrad = context.createLinearGradient(
    0,
    trayY + 5,
    0,
    trayY + trayH,
  );
  bottomGrad.addColorStop(0, "rgb(75,75,92)");
  bottomGrad.addColorStop(0.3, "rgb(100,100,118)");
  bottomGrad.addColorStop(1, "rgb(65,65,80)");
  context.fillStyle = bottomGrad;
  context.fillRect(trayX, trayY + 5, trayW, trayH - 5);

  // Tray front lip
  const lipGrad = context.createLinearGradient(
    0,
    trayY + trayH - 6,
    0,
    trayY + trayH,
  );
  lipGrad.addColorStop(0, "rgb(225,225,238)");
  lipGrad.addColorStop(1, "rgb(120,120,138)");
  context.fillStyle = lipGrad;
  drawRoundedRect(trayX - 3, trayY + trayH - 6, trayW + 6, 8, 3);
  context.fill();

  // Tray side walls
  context.fillStyle = "rgb(110,110,128)";
  context.fillRect(trayX - 3, trayY - 5, 4, trayH + 7);
  context.fillRect(trayX + trayW - 1, trayY - 5, 4, trayH + 7);

  // Inner shadow
  const shadowGrad = context.createLinearGradient(0, trayY + 5, 0, trayY + 18);
  shadowGrad.addColorStop(0, "rgba(0,0,0,0.4)");
  shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = shadowGrad;
  context.fillRect(trayX + 1, trayY + 5, trayW - 2, 13);

  // Outline
  context.lineWidth = 1;
  context.strokeStyle = "rgb(80,80,98)";
  context.strokeRect(trayX - 3, trayY - 5, trayW + 6, trayH + 7);

  // Payout slot (dark opening at the top-center of the tray)
  const slotW = 120;
  const slotH = 10;
  const slotX = trayX + trayW / 2 - slotW / 2;
  const slotY = trayY - 3;

  context.fillStyle = "rgb(10,10,10)";
  drawRoundedRect(slotX, slotY, slotW, slotH, 3);
  context.fill();

  // Slot inner bevel
  context.lineWidth = 1.5;
  context.strokeStyle = "rgb(65,65,80)";
  drawRoundedRect(slotX, slotY, slotW, slotH, 3);
  context.stroke();

  // Subtle highlight on slot rim
  context.strokeStyle = "rgba(180,180,190,0.4)";
  context.beginPath();
  context.moveTo(slotX + 4, slotY);
  context.lineTo(slotX + slotW - 4, slotY);
  context.stroke();
}

// Persistent coin positions so they don't jump around each frame
let coinPositions = [];
let lastCoinCount = -1;

function updateCoinPositions() {
  const count = Math.min(Math.max(credits - fallingCoins.length, 0), 50); // exclude in-flight coins
  if (count === lastCoinCount) return;
  lastCoinCount = count;

  // Keep existing coins, add/remove as needed
  while (coinPositions.length < count) {
    const i = coinPositions.length;
    // Spread coins evenly across the tray
    const margin = 16;
    const usableW = trayW - margin * 2;
    coinPositions.push({
      x: trayX + margin + Math.random() * usableW,
      y: trayY + trayH - 8 - Math.floor(i / 10) * 4 + (Math.random() - 0.5) * 3,
    });
  }
  while (coinPositions.length > count) {
    coinPositions.pop();
  }
}

function drawCoin(cx, cy, bright) {
  const rX = 13; // horizontal radius
  const rY = 5; // vertical radius (perspective)
  const thickness = 3; // visible edge height

  // Edge (bottom rim for 3D thickness)
  const edgeGrad = context.createLinearGradient(cx - rX, 0, cx + rX, 0);
  edgeGrad.addColorStop(0, "rgb(140,105,10)");
  edgeGrad.addColorStop(0.5, "rgb(180,140,25)");
  edgeGrad.addColorStop(1, "rgb(120,90,8)");
  context.beginPath();
  context.ellipse(cx, cy + thickness, rX, rY, 0, 0, Math.PI * 2);
  context.fillStyle = edgeGrad;
  context.fill();

  // Face
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

  // Inner ring detail
  context.beginPath();
  context.ellipse(cx, cy, rX - 3, rY - 1.5, 0, 0, Math.PI * 2);
  context.strokeStyle = "rgba(160,120,15,0.4)";
  context.lineWidth = 0.5;
  context.stroke();

  // Specular highlight
  context.beginPath();
  context.ellipse(cx - 2, cy - 1.5, 5, 2, -0.3, 0, Math.PI * 2);
  context.fillStyle = "rgba(255,255,220,0.35)";
  context.fill();
}

function drawCoins() {
  updateCoinPositions();
  if (coinPositions.length === 0) return;

  coinPositions.forEach((coin) => {
    drawCoin(coin.x, coin.y, false);
  });

  // Draw falling coins (animated payout)
  fallingCoins.forEach((fc) => {
    drawCoin(fc.x, fc.y, true);
  });
}
