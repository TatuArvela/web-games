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

// ── Sign / logo ──────────────────────────────────────────
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

function drawSignLights() {
  const broke = credits <= 0 && state === "idle";
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
    const topOn =
      !broke &&
      (winning ? Math.sin(time * 3) > 0 : Math.sin(time + i * 0.8) > 0);
    const onStates = [topOn, !broke && (winning ? topOn : !topOn)];

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
        context.fillStyle = isOn ? on : off;
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

// ── Top section ──────────────────────────────────────────
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
  topEdgeGrad.addColorStop(0.00, "rgb(55, 57, 72)");
  topEdgeGrad.addColorStop(0.40, "rgb(100, 102, 118)");
  topEdgeGrad.addColorStop(0.70, "rgb(85, 87, 102)");
  topEdgeGrad.addColorStop(1.00, "rgb(50, 52, 66)");

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

  const lightGradient = context.createLinearGradient(0, cardY, 0, cardY + cardH);
  lightGradient.addColorStop(0, "rgb(215, 222, 235)");
  lightGradient.addColorStop(1, "rgb(238, 243, 252)");

  context.fillStyle = lightGradient;
  drawRoundedRect(cardX, cardY, cardW, cardH, 6);
  context.fill();

  context.strokeStyle = "rgb(117,117,117)";
  context.lineWidth = 1;

  // Horizontal divider between the two rows
  const dividerY = cardY + cardH / 2;
  context.beginPath();
  context.moveTo(cardX + 1, dividerY);
  context.lineTo(cardX + cardW - 1, dividerY);
  context.stroke();

  // Vertical dividers between the five columns
  for (let i = 1; i < 5; i++) {
    const dx = cardX + i * colW;
    context.beginPath();
    context.moveTo(dx, cardY + 1);
    context.lineTo(dx, cardY + cardH - 1);
    context.stroke();
  }

  // Row centers (2 rows)
  const rowCenters = [cardY + cardH * 0.25, cardY + cardH * 0.75];

  // Combo entries: [row, col, sym1, sym2, sym3, payout]
  // sym values: emoji string | '7' | 'bar' | null (any/wildcard)
  // 2 rows × 5 cols, lesser wins on left → bigger wins on right
  const entries = [
    // Top row: cherry combos, then 7/bar mix, then bell
    [0, 0, "🍒", null, null, 2],
    [0, 1, "🍒", "🍒", null, 5],
    [0, 2, "🍒", "🍒", "🍒", 10],
    [0, 3, "7", "bar", "7", 15],
    [0, 4, "🔔", "🔔", "🔔", 20],
    // Bottom row: fruit combos, then BAR×3, then 7×7×7
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

function drawCoinSlot() {
  const x = trayX + trayW + 68;
  const y = trayY + trayH / 2 - 16;

  // Dimensions of the extruded slot housing
  const slotW = 60; // width of the opening at top
  const slotH = 24; // total height of the housing
  const baseW = 50; // narrower at the bottom
  const lipH = 5; // thickness of the top rim
  const funnelDepth = 8; // how deep the funnel walls look

  // Back plate — dark recessed area behind the slot
  const backGrad = context.createLinearGradient(
    0,
    y - slotH / 2,
    0,
    y + slotH / 2,
  );
  backGrad.addColorStop(0, "rgb(55,55,68)");
  backGrad.addColorStop(1, "rgb(40,40,52)");
  context.fillStyle = backGrad;
  context.beginPath();
  context.roundRect(
    x - slotW / 2 - 6,
    y - slotH / 2 - 4,
    slotW + 12,
    slotH + 8,
    5,
  );
  context.fill();

  // Left wall — angled trapezoid side
  const leftWallGrad = context.createLinearGradient(
    x - slotW / 2,
    0,
    x - baseW / 2,
    0,
  );
  leftWallGrad.addColorStop(0, "rgb(200,202,218)");
  leftWallGrad.addColorStop(1, "rgb(140,142,160)");
  context.fillStyle = leftWallGrad;
  context.beginPath();
  context.moveTo(x - slotW / 2, y - slotH / 2);
  context.lineTo(x - baseW / 2, y + slotH / 2);
  context.lineTo(x - baseW / 2 - funnelDepth, y + slotH / 2);
  context.lineTo(x - slotW / 2 - funnelDepth, y - slotH / 2);
  context.closePath();
  context.fill();

  // Right wall — angled trapezoid side
  const rightWallGrad = context.createLinearGradient(
    x + baseW / 2,
    0,
    x + slotW / 2,
    0,
  );
  rightWallGrad.addColorStop(0, "rgb(130,132,150)");
  rightWallGrad.addColorStop(1, "rgb(185,188,205)");
  context.fillStyle = rightWallGrad;
  context.beginPath();
  context.moveTo(x + slotW / 2, y - slotH / 2);
  context.lineTo(x + baseW / 2, y + slotH / 2);
  context.lineTo(x + baseW / 2 + funnelDepth, y + slotH / 2);
  context.lineTo(x + slotW / 2 + funnelDepth, y - slotH / 2);
  context.closePath();
  context.fill();

  // Inner face — the funnel surface between top opening and slit
  const innerGrad = context.createLinearGradient(
    0,
    y - slotH / 2,
    0,
    y + slotH / 2,
  );
  innerGrad.addColorStop(0, "rgb(170,172,190)");
  innerGrad.addColorStop(0.5, "rgb(135,138,158)");
  innerGrad.addColorStop(1, "rgb(100,102,120)");
  context.fillStyle = innerGrad;
  context.beginPath();
  context.moveTo(x - slotW / 2, y - slotH / 2);
  context.lineTo(x + slotW / 2, y - slotH / 2);
  context.lineTo(x + baseW / 2, y + slotH / 2);
  context.lineTo(x - baseW / 2, y + slotH / 2);
  context.closePath();
  context.fill();

  // Top rim — bright lip catching light
  const rimGrad = context.createLinearGradient(
    0,
    y - slotH / 2 - lipH,
    0,
    y - slotH / 2 + 1,
  );
  rimGrad.addColorStop(0, "rgb(240,242,252)");
  rimGrad.addColorStop(0.5, "rgb(215,218,235)");
  rimGrad.addColorStop(1, "rgb(170,172,192)");
  context.fillStyle = rimGrad;
  context.beginPath();
  context.roundRect(
    x - slotW / 2 - funnelDepth - 1,
    y - slotH / 2 - lipH,
    slotW + funnelDepth * 2 + 2,
    lipH + 1,
    [3, 3, 0, 0],
  );
  context.fill();

  // The actual coin slit at the bottom — dark opening
  const slitW2 = baseW - 4;
  const slitH2 = 4;
  const slitY = y + slotH / 2 - 2;
  context.fillStyle = "rgb(10,10,14)";
  context.beginPath();
  context.roundRect(x - slitW2 / 2, slitY - slitH2 / 2, slitW2, slitH2, 2);
  context.fill();

  // Edge highlights and shadows for definition
  context.strokeStyle = "rgb(70,70,85)";
  context.lineWidth = 0.75;
  // Left edge
  context.beginPath();
  context.moveTo(x - slotW / 2, y - slotH / 2);
  context.lineTo(x - baseW / 2, y + slotH / 2);
  context.stroke();
  // Right edge
  context.beginPath();
  context.moveTo(x + slotW / 2, y - slotH / 2);
  context.lineTo(x + baseW / 2, y + slotH / 2);
  context.stroke();

  // Top edge highlight
  context.strokeStyle = "rgba(255,255,255,0.5)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(x - slotW / 2 - funnelDepth, y - slotH / 2 - lipH);
  context.lineTo(x + slotW / 2 + funnelDepth, y - slotH / 2 - lipH);
  context.stroke();

  // Bottom edge shadow
  context.strokeStyle = "rgb(50,50,62)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(x - baseW / 2 - funnelDepth, y + slotH / 2);
  context.lineTo(x + baseW / 2 + funnelDepth, y + slotH / 2);
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

  const edgeGrad = context.createLinearGradient(0, topMargin, 0, topMargin + frameHeight);
  edgeGrad.addColorStop(0.00, "rgb(55, 57, 72)");
  edgeGrad.addColorStop(0.25, "rgb(100, 102, 118)");
  edgeGrad.addColorStop(0.50, "rgb(75, 77, 92)");
  edgeGrad.addColorStop(0.75, "rgb(95, 97, 112)");
  edgeGrad.addColorStop(1.00, "rgb(45, 47, 62)");

  context.lineWidth = 3;
  context.strokeStyle = edgeGrad;
  drawRoundedRect(0, topMargin, frameWidth, frameHeight, 30);
  context.stroke();
}

function drawFrameFront() {
  const fL = drumsHorizontalMargin;
  const fT = drumsVerticalMargin + topMargin;
  const drumW = drumsWidth / 3;

  // Single shared vertical chrome gradient — all stroked rects sample the same gradient,
  // so every border segment is tonally consistent (uniform chrome look across the whole frame).
  const chrome = context.createLinearGradient(
    0,
    fT - 20,
    0,
    fT + drumsHeight + 20,
  );
  chrome.addColorStop(0.0, "rgb(70, 72, 88)"); // dark top
  chrome.addColorStop(0.08, "rgb(120, 122, 140)"); // ramp
  chrome.addColorStop(0.18, "rgb(195, 197, 212)"); // rising
  chrome.addColorStop(0.3, "rgb(240, 241, 250)"); // near-white
  chrome.addColorStop(0.38, "rgb(255, 255, 255)"); // specular peak
  chrome.addColorStop(0.46, "rgb(235, 237, 248)"); // fall-off
  chrome.addColorStop(0.58, "rgb(185, 187, 202)"); // mid
  chrome.addColorStop(0.72, "rgb(225, 227, 238)"); // secondary highlight
  chrome.addColorStop(0.82, "rgb(175, 177, 192)"); // dip
  chrome.addColorStop(0.92, "rgb(105, 107, 122)"); // shadow
  chrome.addColorStop(1.0, "rgb(65, 67, 82)"); // dark bottom

  // Outer border strokes around each drum (20px — dividers where rects abut become 20px shared)
  context.lineWidth = 20;
  context.strokeStyle = chrome;
  drums.forEach((_, index) => {
    context.beginPath();
    context.rect(drumW * index + fL, fT, drumW, drumsHeight);
    context.closePath();
    context.stroke();
  });

  // Thin dark outer outline for crisp edge definition
  context.lineWidth = 1.5;
  context.strokeStyle = "rgba(0,0,0,0.55)";
  drawRoundedRect(fL - 10, fT - 10, drumsWidth + 20, drumsHeight + 20, 10);
  context.stroke();

  // Thin bright inner highlight where chrome meets the drum recess
  context.lineWidth = 1;
  context.strokeStyle = "rgba(255,255,255,0.25)";
  context.strokeRect(fL + 10, fT + 10, drumsWidth - 20, drumsHeight - 20);

  // Inner shadow cast onto each drum from the chrome border
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

// ── Bottom ───────────────────────────────────────────────
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

  const bottomEdgeGrad = context.createLinearGradient(0, topMargin + frameHeight - 40, 0, topMargin + frameHeight + bottomMargin);
  bottomEdgeGrad.addColorStop(0.00, "rgb(55, 57, 72)");
  bottomEdgeGrad.addColorStop(0.40, "rgb(100, 102, 118)");
  bottomEdgeGrad.addColorStop(0.70, "rgb(85, 87, 102)");
  bottomEdgeGrad.addColorStop(1.00, "rgb(50, 52, 66)");

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

// ── Coin tray & coins ────────────────────────────────────
const trayX = 42;
const trayY = topMargin + frameHeight + bottomMargin - 85;
const trayW = frameWidth - 184;
const trayH = 55;

function drawCoinTray() {
  const wallW = 6; // side wall thickness

  // Tray interior — dark recessed bowl
  const interiorGrad = context.createLinearGradient(0, trayY - 5, 0, trayY + trayH);
  interiorGrad.addColorStop(0.00, "rgb(58, 58, 70)");
  interiorGrad.addColorStop(0.20, "rgb(68, 68, 82)");
  interiorGrad.addColorStop(0.65, "rgb(78, 78, 92)");
  interiorGrad.addColorStop(1.00, "rgb(65, 65, 78)");
  context.fillStyle = interiorGrad;
  context.fillRect(trayX, trayY - 5, trayW, trayH + 5);

  // Left side wall — gradient gives angled-wall impression
  const leftWallGrad = context.createLinearGradient(trayX - wallW, 0, trayX, 0);
  leftWallGrad.addColorStop(0, "rgb(148, 150, 165)");
  leftWallGrad.addColorStop(0.5, "rgb(185, 187, 202)");
  leftWallGrad.addColorStop(1, "rgb(118, 120, 135)");
  context.fillStyle = leftWallGrad;
  context.fillRect(trayX - wallW, trayY - 5, wallW, trayH + 5);

  // Right side wall
  const rightWallGrad = context.createLinearGradient(trayX + trayW, 0, trayX + trayW + wallW, 0);
  rightWallGrad.addColorStop(0, "rgb(118, 120, 135)");
  rightWallGrad.addColorStop(0.5, "rgb(165, 167, 182)");
  rightWallGrad.addColorStop(1, "rgb(138, 140, 155)");
  context.fillStyle = rightWallGrad;
  context.fillRect(trayX + trayW, trayY - 5, wallW, trayH + 5);

  // Back wall (top rim) — chrome lip catching overhead light
  const backGrad = context.createLinearGradient(0, trayY - 8, 0, trayY + 2);
  backGrad.addColorStop(0.00, "rgb(185, 187, 202)");
  backGrad.addColorStop(0.35, "rgb(228, 230, 242)");
  backGrad.addColorStop(0.60, "rgb(205, 207, 220)");
  backGrad.addColorStop(1.00, "rgb(120, 122, 137)");
  context.fillStyle = backGrad;
  context.fillRect(trayX - wallW, trayY - 8, trayW + wallW * 2, 10);

  // Front lip — chrome rail along the bottom edge
  const lipGrad = context.createLinearGradient(0, trayY + trayH - 1, 0, trayY + trayH + 11);
  lipGrad.addColorStop(0.00, "rgb(85, 87, 102)");
  lipGrad.addColorStop(0.18, "rgb(158, 160, 175)");
  lipGrad.addColorStop(0.40, "rgb(222, 224, 236)");
  lipGrad.addColorStop(0.52, "rgb(242, 244, 252)");
  lipGrad.addColorStop(0.65, "rgb(215, 217, 230)");
  lipGrad.addColorStop(0.85, "rgb(150, 152, 167)");
  lipGrad.addColorStop(1.00, "rgb(82, 84, 99)");
  context.fillStyle = lipGrad;
  context.beginPath();
  context.roundRect(trayX - wallW, trayY + trayH - 1, trayW + wallW * 2, 12, [0, 0, 5, 5]);
  context.fill();

  // Inner top shadow (cast from back wall onto tray floor)
  const topShadow = context.createLinearGradient(0, trayY + 2, 0, trayY + 20);
  topShadow.addColorStop(0, "rgba(0,0,0,0.35)");
  topShadow.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = topShadow;
  context.fillRect(trayX, trayY + 2, trayW, 18);

  // Inner left shadow
  const leftShadow = context.createLinearGradient(trayX, 0, trayX + 16, 0);
  leftShadow.addColorStop(0, "rgba(0,0,0,0.18)");
  leftShadow.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = leftShadow;
  context.fillRect(trayX, trayY + 2, 16, trayH - 2);

  // Inner right shadow
  const rightShadow = context.createLinearGradient(trayX + trayW - 16, 0, trayX + trayW, 0);
  rightShadow.addColorStop(0, "rgba(0,0,0,0)");
  rightShadow.addColorStop(1, "rgba(0,0,0,0.18)");
  context.fillStyle = rightShadow;
  context.fillRect(trayX + trayW - 16, trayY + 2, 16, trayH - 2);

  // Gradient outline — matches the rest of the machine borders
  const outlineGrad = context.createLinearGradient(0, trayY - 8, 0, trayY + trayH + 12);
  outlineGrad.addColorStop(0.00, "rgb(90, 92, 108)");
  outlineGrad.addColorStop(0.40, "rgb(128, 130, 146)");
  outlineGrad.addColorStop(0.70, "rgb(110, 112, 128)");
  outlineGrad.addColorStop(1.00, "rgb(80, 82, 97)");
  context.lineWidth = 2;
  context.strokeStyle = outlineGrad;
  context.beginPath();
  context.roundRect(trayX - wallW, trayY - 8, trayW + wallW * 2, trayH + 21, [3, 3, 5, 5]);
  context.stroke();

  // Payout slot — dark coin opening in the back wall
  const slotW = 120;
  const slotH = 9;
  const slotX = trayX + trayW / 2 - slotW / 2;
  const slotY = trayY - 5;

  // Slot recess shadow
  context.fillStyle = "rgb(6, 6, 10)";
  context.beginPath();
  context.roundRect(slotX - 1, slotY - 1, slotW + 2, slotH + 2, 4);
  context.fill();

  // Slot opening
  context.fillStyle = "rgb(14, 14, 20)";
  context.beginPath();
  context.roundRect(slotX, slotY, slotW, slotH, 3);
  context.fill();

  // Slot rim highlight
  context.lineWidth = 1;
  context.strokeStyle = "rgba(190, 192, 210, 0.45)";
  context.beginPath();
  context.moveTo(slotX + 5, slotY - 1);
  context.lineTo(slotX + slotW - 5, slotY - 1);
  context.stroke();
}


function drawCoin(cx, cy, bright) {
  const rX = 17; // horizontal radius
  const rY = 7; // vertical radius (perspective)
  const thickness = 4; // visible edge height

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
  context.ellipse(cx, cy, rX - 4, rY - 2, 0, 0, Math.PI * 2);
  context.strokeStyle = "rgba(160,120,15,0.4)";
  context.lineWidth = 0.5;
  context.stroke();

  // Specular highlight
  context.beginPath();
  context.ellipse(cx - 2, cy - 2, 6, 2.5, -0.3, 0, Math.PI * 2);
  context.fillStyle = "rgba(255,255,220,0.35)";
  context.fill();
}

function drawCoins() {
  if (coins.length === 0) return;
  // Settled coins first, unsettled (falling/bright) on top
  for (const coin of coins) {
    if (coin.settled) drawCoin(coin.x, coin.y, false);
  }
  for (const coin of coins) {
    if (!coin.settled) drawCoin(coin.x, coin.y, true);
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

  drawBottom();

  drawArmBase();
  drawArm();
  drawArmBall();

  drawFrameBack();
  drawDrums();
  drawFrameFront();

  drawCoinTray();
  drawCoins();
  drawCoinSlot();

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
