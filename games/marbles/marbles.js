/*
 * Globals
 * */

const canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 600;
const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;

const hiScoreStorageKey = "MARBLES_HI_SCORE";

const boardWidth = 600;
const boardHeight = 400;

const updateIntervalMs = 10;
const friction = 0.98;
const marbleRadius = 12;
const maxFallTime = 2000 / updateIntervalMs;
const waitAfterMoveMs = 1000;

const pointsForTouch = 1;
const pointsForElimination = 20;
const pointsForClear = 500;

/*
 * State
 * */

let numMarbles = 50;
let marbles = [];
let activeMarble = null;

let mouseMovePosition = null;
let waiting = false;
let waitTimeout = null;

let touchCombo = 0;
let eliminationCombo = 0;
let score = 0;
let hiScore = localStorage.getItem(hiScoreStorageKey) ?? 0;
let isGameOver = false;

class Marble {
  constructor(x, y, color, isControllable) {
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;
    this.color = color;
    this.isControllable = isControllable;
    this.isFalling = false;
    this.fallTime = 0;
    this.isEnabled = true;
  }
}

/*
 * Mechanics
 * */

function updateCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function getBoardOffsetX() {
  return (canvas.width - boardWidth) / 2;
}

function getBoardOffsetY() {
  return (canvas.height - boardHeight) / 2;
}

function getCanvasEventPosition(event) {
  const rect = canvas.getBoundingClientRect();
  const scale = canvas.width / canvas.clientWidth;
  const x = (event.clientX - rect.left) * scale;
  const y = (event.clientY - rect.top) * scale;
  return [x, y];
}

function getBoardEventPosition(event) {
  const [canvasX, canvasY] = getCanvasEventPosition(event);
  const boardOffsetX = getBoardOffsetX();
  const boardOffsetY = getBoardOffsetY();
  const boardX = canvasX - boardOffsetX;
  const boardY = canvasY - boardOffsetY;
  return [boardX, boardY];
}

function moveMarble(marble) {
  marble.x += marble.speedX;
  marble.y += marble.speedY;

  marble.speedX *= friction;
  marble.speedY *= friction;

  if (Math.hypot(marble.speedX, marble.speedY) < 0.05) {
    marble.speedX = 0;
    marble.speedY = 0;
  }

  if (!isMarbleInsideBoard(marble)) {
    marble.isFalling = true;
  }

  if (marble.isFalling) {
    if (!marble.eliminated) {
      eliminationCombo++;
      score += eliminationCombo * pointsForElimination;
      marble.eliminated = true;
      updateWait();
    }

    marble.fallTime = Math.min(marble.fallTime + 1, maxFallTime);
    if (marble.fallTime === maxFallTime) {
      marble.speedX = 0;
      marble.speedY = 0;
      marble.isEnabled = false;
    }
  }
}

function isMarbleInsideBoard(marble) {
  return (
    marble.x >= 0 &&
    marble.x <= boardWidth &&
    marble.y >= 0 &&
    marble.y <= boardHeight
  );
}

function isMarbleInMarble(marble1, marble2) {
  const dx = marble1.x - marble2.x;
  const dy = marble1.y - marble2.y;
  return Math.sqrt(dx * dx + dy * dy) < 2 * marbleRadius;
}

function isPointInMarble(marble, mouseX, mouseY) {
  const dx = marble.x - mouseX;
  const dy = marble.y - mouseY;
  return Math.sqrt(dx * dx + dy * dy) < marbleRadius;
}

function detectAndResolveCollisions(marbles) {
  for (let i = 0; i < marbles.length - 1; i++) {
    const m1 = marbles[i];
    if (m1.isFalling) continue;

    for (let j = i + 1; j < marbles.length; j++) {
      const m2 = marbles[j];
      if (m2.isFalling) continue;

      let dx = m2.x - m1.x;
      let dy = m2.y - m1.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 2 * marbleRadius) {
        // Calculate the normal vector
        let nx = dx / distance;
        let ny = dy / distance;

        // Decompose velocities into normal and tangential components
        let v1n = m1.speedX * nx + m1.speedY * ny;
        let v1t = -m1.speedX * ny + m1.speedY * nx;
        let v2n = m2.speedX * nx + m2.speedY * ny;
        let v2t = -m2.speedX * ny + m2.speedY * nx;

        // Conserve momentum and energy only along the line of impact (normal direction)
        let v1nPost = v2n;
        let v2nPost = v1n;

        // Convert scalar normal and tangential velocities into vectors
        m1.speedX = v1nPost * nx - v1t * ny;
        m1.speedY = v1nPost * ny + v1t * nx;
        m2.speedX = v2nPost * nx - v2t * ny;
        m2.speedY = v2nPost * ny + v2t * nx;

        // Adjust positions to resolve overlap
        let overlap = 0.5 * (2 * marbleRadius - distance + 1); // Add a small buffer to ensure separation
        m1.x -= overlap * nx;
        m1.y -= overlap * ny;
        m2.x += overlap * nx;
        m2.y += overlap * ny;

        touchCombo++;
        score += touchCombo * pointsForTouch;
        m1.isControllable = true;
        m2.isControllable = true;
      }
    }
  }
}

function asHexColor(r, g, b) {
  const rString = r.toString(16).padStart(2, "0");
  const gString = g.toString(16).padStart(2, "0");
  const bString = b.toString(16).padStart(2, "0");
  return `#${rString}${gString}${bString}`;
}

function generateDistinctBrightColor() {
  const ceil = 255;
  const floor = 128;
  const colorStep = 5;

  const channelMax = ceil;
  const channelMid =
    Math.floor(Math.random() * ((ceil - floor) / colorStep)) * colorStep +
    floor;
  const channelMin = floor;

  const whichChannel = Math.floor(Math.random() * 3);

  let r, g, b;
  switch (whichChannel) {
    case 0:
      r = channelMax;
      g = channelMid;
      b = channelMin;
      break;
    case 1:
      r = channelMin;
      g = channelMax;
      b = channelMid;
      break;
    case 2:
      r = channelMid;
      g = channelMin;
      b = channelMax;
      break;
  }

  return asHexColor(r, g, b);
}

function generateMarbles(numMarbles, boardWidth, boardHeight, marbleRadius) {
  let marbles = [];
  let attempts = 0;

  for (let i = 0; i < numMarbles; i++) {
    let overlap = false;
    let newMarble;

    do {
      let x = Math.random() * (boardWidth - 2 * marbleRadius) + marbleRadius;
      let y = Math.random() * (boardHeight - 2 * marbleRadius) + marbleRadius;
      let color = generateDistinctBrightColor();

      newMarble = new Marble(x, y, color, i === 0);

      overlap = marbles.some((marble) => isMarbleInMarble(marble, newMarble));

      attempts++;

      if (attempts > 1000) {
        throw new Error("Too many attempts to place non-overlapping marbles.");
      }
    } while (overlap);

    marbles.push(newMarble);
  }

  return marbles;
}

/*
 * Control
 * */

function findActiveMarble(event) {
  const [mouseX, mouseY] = getBoardEventPosition(event);
  return (
    marbles.find(
      (marble) =>
        marble.isControllable && isPointInMarble(marble, mouseX, mouseY)
    ) ?? null
  );
}

function updateWait() {
  waiting = true;
  if (waitTimeout) {
    clearTimeout(waitTimeout);
  }
  waitTimeout = setTimeout(() => {
    waiting = false;
  }, waitAfterMoveMs);
}

function isMoveInProgress() {
  return waiting || marbles.some((marble) => {
    if (!marble.isEnabled) {
      return false;
    }
    const isMoving = Boolean(
      Math.abs(marble.speedX) > 0 || Math.abs(marble.speedY) > 0
    );
    return !marble.isFalling && isMoving;
  });
}

function areMarblesCleared() {
  return marbles.every((marble) => {
    return !marble.isEnabled;
  });
}

function initialize() {
  score = 0;
  touchCombo = 0;
  eliminationCombo = 0;
  isGameOver = false;

  marbles = generateMarbles(numMarbles, boardWidth, boardHeight, marbleRadius);
}

function update() {
  if (isGameOver) {
    return;
  }

  marbles.forEach(moveMarble);

  detectAndResolveCollisions(marbles);

  isGameOver = !marbles.some((marble) => {
    return marble.isEnabled && marble.isControllable || marble.speedX !== 0 && marble.speedY !== 0;
  });

  if (isGameOver && areMarblesCleared()) {
    score += pointsForClear;
  }

  if (!isMoveInProgress()) {
    eliminationCombo = 0;
  }
}

function clearCanvas() {
  context.fillStyle = "#808080";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBoardShadow() {
  context.save();

  context.translate(getBoardOffsetX(), getBoardOffsetY());

  context.shadowColor = "rgba(0, 0, 0, 0.5)";
  context.shadowBlur = 10;
  context.fillStyle = "black";
  context.fillRect(0, 0, boardWidth, boardHeight);

  context.restore();
}

function drawBoard() {
  const stripeWidth = 20;
  const stripeColor1 = "#ddd";
  const stripeColor2 = "#ccc";
  const angleInDegrees = 45;
  const angleInRadians = (Math.PI / 180) * angleInDegrees;

  context.save();

  context.translate(getBoardOffsetX(), getBoardOffsetY());
  context.rect(0, 0, boardWidth, boardHeight);
  context.clip();

  context.fillStyle = stripeColor1;
  context.fillRect(0, 0, boardWidth, boardHeight);

  context.fillStyle = stripeColor2;

  context.rotate(angleInRadians);

  const rotatedWidth =
    boardWidth * Math.abs(Math.cos(angleInRadians)) +
    boardHeight * Math.abs(Math.sin(angleInRadians));
  const rotatedHeight =
    boardHeight * Math.abs(Math.cos(angleInRadians)) +
    boardWidth * Math.abs(Math.sin(angleInRadians));
  const length = Math.max(rotatedWidth, rotatedHeight);

  for (let i = -length; i < length; i += stripeWidth * 2) {
    context.fillRect(i, -length, stripeWidth, length * 2);
  }

  context.restore();
}

function drawMarble(marble) {
  if (!marble.isEnabled) {
    return;
  }

  context.save();

  context.beginPath();

  const lineWidth = 4;

  context.arc(
    marble.x + getBoardOffsetX(),
    marble.y + getBoardOffsetY(),
    (marbleRadius - 3 / 2) *
    Math.exp(-marble.fallTime / (maxFallTime / Math.log(maxFallTime))),
    0,
    2 * Math.PI,
    false
  );

  context.fillStyle = marble.color;
  context.fill();

  context.lineWidth = 3;
  context.strokeStyle = marble.isControllable ? 'black' : 'gray';
  context.stroke();

  context.restore();
}

function getAbsDistance(a, b) {
  return Math.abs(a > b ? a - b : b - a);
}

function drawLine() {
  context.beginPath();
  context.moveTo(
    activeMarble.x + getBoardOffsetX(),
    activeMarble.y + getBoardOffsetY()
  );

  context.strokeStyle = "rgb(20,119,200)";
  context.lineWidth = 3;

  const [x, y] = mouseMovePosition;

  context.lineTo(x, y);
  context.stroke();
}

function applyFontStyle(context, fontSize) {
  context.textAlign = "center";
  context.font = `${fontSize}px "Jersey 10"`;
  context.fontWeight = "bold";

  context.shadowOffsetX = 2;
  context.shadowOffsetY = 2;
  context.shadowColor = "black";
}

function drawOverlay() {
  context.fillStyle = "rgba(0,0,0,0.2)";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawHiScore() {
  context.save();
  const fontSize = 40;
  context.fillStyle = "white";
  applyFontStyle(context, fontSize);
  context.fillText(`Hi-Score: ${hiScore}`, canvas.width / 2, 10 + fontSize);
  context.restore();
}

function drawScore() {
  context.save();
  const fontSize = 40;
  context.fillStyle = "white";
  applyFontStyle(context, fontSize);
  context.fillText(`Score: ${score}`, canvas.width / 2, 40 + fontSize);
  context.restore();
}

function drawEliminationCombo() {
  context.save();
  const fontSize = 60;
  context.fillStyle = "rgb(252,103,240)";
  applyFontStyle(context, fontSize);
  context.fillText(
    `ELIMINATION! x${eliminationCombo}`,
    canvas.width / 2,
    canvas.height / 2
  );
  context.restore();
}

function drawGameOver() {
  context.save();
  const fontSize = 80;
  context.fillStyle = areMarblesCleared() ? "rgb(35, 136, 120)" : "rgb(201, 23, 51)";
  applyFontStyle(context, fontSize);
  context.fillText(
    `${areMarblesCleared() ? "CLEAR!" : "GAME OVER!"}`,
    canvas.width / 2,
    canvas.height / 2
  );
  context.restore();
}

function drawClickToRestart() {
  context.save();
  const fontSize = 40;
  context.fillStyle = "white";
  applyFontStyle(context, fontSize);
  context.fillText(
    `Click to restart`,
    canvas.width / 2,
    canvas.height / 2 + fontSize
  );
  context.restore();
}

function draw() {
  clearCanvas();

  drawBoardShadow();
  drawBoard();

  marbles.forEach((marble) => {
    drawMarble(marble);
  });

  if (activeMarble) {
    drawLine();
  }

  if (isMoveInProgress()) {
    drawOverlay();
  }

  drawHiScore();
  drawScore();
  if (eliminationCombo > 0) {
    drawEliminationCombo();
  }
  if (isGameOver) {
    drawGameOver();
    drawClickToRestart();
    if (score > hiScore) {
      hiScore = score;
      localStorage.setItem(hiScoreStorageKey, hiScore);
    }
  }
}

function drawLoop() {
  draw();
  requestAnimationFrame(drawLoop);
}

/*
 * Initialisation
 */

initialize();

updateCanvasSize();
setInterval(() => update(), updateIntervalMs);
requestAnimationFrame(drawLoop);

window.addEventListener("resize", function () {
  updateCanvasSize();
});

canvas.addEventListener("mousedown", function (downEvent) {
  if (isGameOver) {
    initialize();
  }

  if (isMoveInProgress()) {
    return;
  }

  activeMarble = findActiveMarble(downEvent);

  if (!activeMarble) {
    return;
  }

  mouseMovePosition = getCanvasEventPosition(downEvent);

  const mousemoveEventListener = function (moveEvent) {
    mouseMovePosition = getCanvasEventPosition(moveEvent);
  };

  document.addEventListener(
    "mousemove",
    mousemoveEventListener,
  );

  document.addEventListener(
    "mouseup",
    function () {
      if (activeMarble) {
        touchCombo = 0;
        eliminationCombo = 0;
        const xSign =
          activeMarble.x + getBoardOffsetX() > mouseMovePosition[0] ? 1 : -1;
        const ySign =
          activeMarble.y + getBoardOffsetY() > mouseMovePosition[1] ? 1 : -1;
        activeMarble.speedX +=
          (xSign *
            getAbsDistance(
              activeMarble.x + getBoardOffsetX(),
              mouseMovePosition[0]
            )) /
          5;
        activeMarble.speedY +=
          (ySign *
            getAbsDistance(
              activeMarble.y + getBoardOffsetY(),
              mouseMovePosition[1]
            )) /
          5;
        activeMarble = null;
      }
      document.removeEventListener("mousemove", mousemoveEventListener);
    },
    {once: true}
  );
});
