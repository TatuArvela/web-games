/*
 * Globals
 * */

const canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 600;
const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;

const boardWidth = 600;
const boardHeight = 400;

const updateRate = 100;
const maxVectorLength = 50;
const slowDownRate = 0.005;

class Marble {
  constructor(x, y, color, id, controllable) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;
    this.color = color;
    this.controllable = controllable;
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

  if (Math.abs(marble.speedX) < 0.1) {
    marble.speedX = 0;
  } else {
    marble.speedX = marble.speedX * (1 - slowDownRate);
  }

  if (Math.abs(marble.speedY) < 0.1) {
    marble.speedY = 0;
  } else {
    marble.speedY = marble.speedY * (1 - slowDownRate);
  }
}

function isMarbleInMarble(marble1, marble2) {
  let dx = marble1.x - marble2.x;
  let dy = marble1.y - marble2.y;
  return Math.sqrt(dx * dx + dy * dy) < 2 * marbleRadius;
}

function isPointInMarble(marble, mouseX, mouseY) {
  let dx = marble.x - mouseX;
  let dy = marble.y - mouseY;
  return Math.sqrt(dx * dx + dy * dy) < marbleRadius;
}

function collideMarbles(marble1, marble2) {
  if (isMarbleInMarble(marble1, marble2)) {
    const vCollision = { x: marble2.x - marble1.x, y: marble2.y - marble1.y };
    const distance = Math.sqrt(
      (marble2.x - marble1.x) * (marble2.x - marble1.x) +
        (marble2.y - marble1.y) * (marble2.y - marble1.y)
    );
    const vCollisionNorm = {
      x: vCollision.x / distance,
      y: vCollision.y / distance,
    };
    const vRelativeVelocity = {
      x: marble1.speedX - marble2.speedX,
      y: marble1.speedY - marble2.speedY,
    };
    const speed =
      vRelativeVelocity.x * vCollisionNorm.x +
      vRelativeVelocity.y * vCollisionNorm.y;

    if (speed < 0) {
      return;
    }

    marble1.speedX -= speed * vCollisionNorm.x;
    marble1.speedY -= speed * vCollisionNorm.y;
    marble2.speedX += speed * vCollisionNorm.x;
    marble2.speedY += speed * vCollisionNorm.y;

    marble1.controllable = true;
    marble2.controllable = true;
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

      newMarble = new Marble(x, y, color, i, i === 0);

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
 * State
 * */

let marbleRadius = 12;
let numMarbles = 50;
let marbles = [];
let activeMarble = null;

let mouseMovePosition = null;

function findActiveMarble(event) {
  const [mouseX, mouseY] = getBoardEventPosition(event);
  return (
    marbles.find(
      (marble) => marble.controllable && isPointInMarble(marble, mouseX, mouseY)
    ) ?? null
  );
}

function initialize() {
  marbles = generateMarbles(numMarbles, boardWidth, boardHeight, marbleRadius);
}

function update() {
  marbles.forEach((marble) => {
    moveMarble(marble);
  });
  for (let i = 0; i < marbles.length; i++) {
    for (let j = 0; j < marbles.length; j++) {
      if (i !== j) {
        collideMarbles(marbles[i], marbles[j]);
      }
    }
  }
}

function clearCanvas() {
  context.fillStyle = "#808080";
  context.fillRect(0, 0, canvas.width, canvas.height);
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
  context.beginPath();
  context.arc(
    marble.x + getBoardOffsetX(),
    marble.y + getBoardOffsetY(),
    marbleRadius,
    0,
    2 * Math.PI,
    false
  );
  context.fillStyle = marble.controllable ? "white" : marble.color;
  context.fill();
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

  context.strokeStyle = "blue";
  context.lineWidth = 3;

  const [x, y] = mouseMovePosition;

  context.lineTo(x, y);
  context.stroke();
}

function draw() {
  clearCanvas();
  drawBoard();

  marbles.forEach((marble) => {
    drawMarble(marble);
  });

  if (activeMarble) {
    drawLine();
  }

  requestAnimationFrame(draw);
}

/*
 * Initialisation
 */

initialize();

updateCanvasSize();
setInterval(() => update(), 1000 / updateRate);
requestAnimationFrame(draw);

document.addEventListener("resize", function () {
  updateCanvasSize();
});

canvas.addEventListener("mousedown", function (downEvent) {
  activeMarble = findActiveMarble(downEvent);

  if (!activeMarble) {
    return;
  }

  mouseMovePosition = getCanvasEventPosition(downEvent);

  const mousemoveEventListener = document.addEventListener(
    "mousemove",
    function (moveEvent) {
      mouseMovePosition = getCanvasEventPosition(moveEvent);
    }
  );

  document.addEventListener(
    "mouseup",
    function () {
      if (activeMarble) {
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
          10;
        activeMarble.speedY +=
          (ySign *
            getAbsDistance(
              activeMarble.y + getBoardOffsetY(),
              mouseMovePosition[1]
            )) /
          10;
        activeMarble = null;
      }
      document.removeEventListener("mousemove", mousemoveEventListener);
    },
    { once: true }
  );
});

// # TODO
// Falling off the board
// Count and show score (combos, moves)
// Restart button
// Level system (change number of marbles, change size of board)
// "Level Complete!" splash
