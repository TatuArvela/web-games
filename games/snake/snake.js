/*
* Globals
* */

// Virtual screen pixels
const screenWidth = 84;
const screenHeight = 48;
const screenPadding = 3;

// Game units = virtual screen pixels / 3
const gameUnitRatio = 3;
const borders = {
  top: 0,
  left: 0,
  right: (screenWidth - 1) / 3,
  bottom: (screenHeight - 1) / 3,
};
const playArea = {
  top: 1,
  right: (screenWidth - 2) / 3,
  bottom: (screenHeight - 2) / 3,
  left: 1,
};
const playAreaWidth = playArea.right - playArea.left;
const playAreaHeight = playArea.bottom - playArea.top ;

const scale = 10;
const scaled = (value) => value * scale;
const black = '#322917';

const canvas = document.getElementById('canvas');
canvas.width = scaled(screenPadding + screenWidth + screenPadding);
canvas.height = scaled(screenPadding + screenHeight + screenPadding);
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;
const scoreDisplay = document.getElementById('score');

const updateInterval = 100; // ms
const gameOverScreenInputGrace = 1500;
const hardBorders = true;


/*
* Objects
* */

function Snake() {
  this.y = 10;
  this.x = 10;
  this.vector = {
    x: 0,
    y: 0,
  };
  this.points = 1;
  this.tail = [{
    x: this.x,
    y: this.y
  }];
}

function Treat() {
  function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min - 1) + min)
  }

  this.x = randomNumber(1, playAreaWidth - 1);
  this.y = randomNumber(1, playAreaHeight - 1);
}


/*
* State
* */

let alive = true;
let sceneDrawn = false;
let treatDrawn = false;
let snakeDrawn = false;
let sectionToClear = null;
let gameOverScreenTimeout;
let gameOverDrawn = false;

let inputEnabled = true;
let snake = new Snake();
let treat = new Treat();


/*
* Functions
*  */

function resetTreat() {
  treat = new Treat();
  treatDrawn = false;
  while (overlapsWithSnakeTail(treat)) {
    treat = new Treat();
  }
}

function overlapsWithSnakeTail(item) {
  for (let i = 0; i < snake.tail.length; i++) {
    if ((snake.tail[i].x === item.x) && (snake.tail[i].y === item.y)) {
      return true;
    }
  }
}


/*
* Graphics utilities
* */

// Takes screen pixels by number, starting from 1
function drawDot(x, y, c = context) {
  c.fillStyle = black;
  c.fillRect(scaled(x) + 1, scaled(y) + 1, scaled(1) - 1, scaled(1) - 1);
}

let borderCache = null;

function drawBorders() {
  if (borderCache === null) {
    borderCache = document.createElement('canvas')
    const borderCacheContext = borderCache.getContext('2d');
    borderCache.width = canvas.width;
    borderCache.height = canvas.height;
  
    function drawHorizontalLine(from, to, height) {
      for (let i = from; i <= to; i++) {
        drawDot(screenPadding + i - 1, screenPadding + height - 1, borderCacheContext);
      }
    }
    
    function drawVerticalLine(from, to, width) {
      for (let i = from; i <= to; i++) {
        drawDot(screenPadding + width - 1, screenPadding + i - 1, borderCacheContext);
      }
    }
  
    const topLeft = [borders.left * gameUnitRatio, borders.top * gameUnitRatio];
    const topRight = [borders.right * gameUnitRatio, borders.top * gameUnitRatio];
    const bottomLeft = [borders.left * gameUnitRatio, borders.bottom * gameUnitRatio];
    const bottomRight = [borders.right * gameUnitRatio, borders.bottom * gameUnitRatio];

    drawHorizontalLine(topLeft[0] + 2, topRight[0], topLeft[1] + 2);
    drawHorizontalLine(bottomLeft[0] + 2, bottomRight[0], bottomLeft[1]);
    drawVerticalLine(topLeft[1] + 3, bottomLeft[1] - 1, topLeft[0] + 2);
    drawVerticalLine(topRight[1] + 3, bottomRight[1] - 1, topRight[0]);
  }
  context.drawImage(borderCache, 0, 0);
}

let snakeSectionCache = null;

function drawSnakeSection(x, y) {
  if (snakeSectionCache === null) {
    snakeSectionCache = document.createElement('canvas');
    const snakeSectionCacheContext = snakeSectionCache.getContext('2d');
    
    for (let x = 0; x <= 2; x++) {
      for (let y = 0; y <= 2; y++) {
        drawDot(screenPadding + x, screenPadding + y, snakeSectionCacheContext);
      }
    }
  }
  context.drawImage(snakeSectionCache, scaled(x * gameUnitRatio), scaled(y * gameUnitRatio));
}

function clearSnakeSection(x, y) {
  context.clearRect(scaled(x * 3 + screenPadding), scaled(y * 3 + screenPadding), scaled(3), scaled(3));
}

function drawSnake() {
  for (let i = 0; i < snake.tail.length; i++) {
    const section = snake.tail[i];
    drawSnakeSection(section.x, section.y);
  }
}

function redrawSnake() {
  if (sectionToClear) {
    clearSnakeSection(sectionToClear.x, sectionToClear.y);
    sectionToClear = null;
  }

  drawSnakeSection(snake.tail[0].x, snake.tail[0].y);
  if (snake.tail.length > 1) {
    drawSnakeSection(snake.tail[snake.tail.length - 1].x, snake.tail[snake.tail.length - 1].y);
  }
}

let treatCache = null;

function drawTreat() {
  if (treatCache === null) {
    treatCache = document.createElement('canvas');
    const treatCacheContext = treatCache.getContext('2d');

    drawDot(1, 0, treatCacheContext);
    drawDot(0, 1, treatCacheContext);
    drawDot(2, 1, treatCacheContext);
    drawDot(1, 2, treatCacheContext);
  }
  const x = treat.x;
  const y = treat.y;
  context.drawImage(treatCache, scaled(x * 3 + screenPadding), scaled(y * 3 + screenPadding));
}

function drawGameOver() {
  if (gameOverDrawn) {
    return;
  }

  context.save();
  context.clearRect(0, 0, canvas.width, canvas.height);

  const score = snake.points;

  context.font = '120px sans-serif';
  context.fontWeight = "bold";
  context.fillStyle = black;
  context.fillText("Game over!", 50, 140);
  context.fillText("Your score:", 50, 280);
  context.fillText(score, 50, 420);

  context.restore();
}

function drawDebugGrid() {
  context.save();
  context.strokeStyle = '#333';

  const maxWidth = screenWidth + screenPadding * 2;
  const maxHeight = screenHeight + screenPadding * 2;

  for (x = 0; x <= maxWidth; x++) {
    context.beginPath();
    context.moveTo(scaled(x), 0);
    context.lineTo(scaled(x), scaled(maxHeight));
    context.stroke();
  }

  for (y = 0; y <= maxHeight; y++) {
    context.beginPath();
    context.moveTo(0, scaled(y));
    context.lineTo(scaled(maxWidth), scaled(y));
    context.stroke();
  }

  context.restore();
}


/*
* Main
* */

function resetGame() {
  snake = new Snake();
  alive = true;
  sceneDrawn = false;
  treatDrawn = false;
  snakeDrawn = false;
  gameOverDrawn = false;
  sectionToClear = null;
}

function endGame() {
  alive = false;
  inputEnabled = false;
  gameOverScreenTimeout = setTimeout(() => {
    inputEnabled = true;
  }, gameOverScreenInputGrace)
}

function update() {
  if (!alive) {
    return;
  }

  snake.x += snake.vector.x;
  snake.y += snake.vector.y;

  // Snake hits left edge
  if (snake.x < 1) {
    if (hardBorders) {
      return endGame();
    }
    snake.x = playAreaWidth;
  }

  // Snake hits right edge
  if (snake.x > playAreaWidth) {
    if (hardBorders) {
      return endGame();
    }
    snake.x = 1;
  }

  // Snake hits top edge
  if (snake.y < 1) {
    if (hardBorders) {
      return endGame();
    }
    snake.y = playAreaHeight;
  }

  // Snake hits bottom edge
  if (snake.y > playAreaHeight) {
    if (hardBorders) {
      return endGame();
    }
    snake.y = 1;
  }

  // Snake bites their tail
  if (snake.tail.length > 3 && overlapsWithSnakeTail(snake)) {
    return endGame();
  }

  // Move tail
  snake.tail.unshift({
    x: snake.x,
    y: snake.y
  })
  if (snake.tail.length > snake.points) {
    sectionToClear = snake.tail.pop();
  }

  // If the snake eats the treat, generate a new treat
  if (treat.x === snake.x && treat.y === snake.y) {
    snake.points++;
    resetTreat();
  }
}

function handleMoveLeft() {
  if (!inputEnabled) {
    return;
  }
  if (!alive) {
    resetGame();
  }
  if (snake.tail.length === 1 || snake.tail[1].x >= snake.x) {
    snake.vector.x = -1;
    snake.vector.y = 0;
  }
}

function handleMoveUp() {
  if (!inputEnabled) {
    return;
  }
  if (!alive) {
    resetGame();
  }
  if (snake.tail.length === 1 || snake.tail[1].y >= snake.y) {
    snake.vector.x = 0;
    snake.vector.y = -1;
  }
}

function handleMoveRight() {
  if (!inputEnabled) {
    return;
  }
  if (!alive) {
    resetGame();
  }
  if (snake.tail.length === 1 || snake.tail[1].x <= snake.x) {
    snake.vector.x = 1;
    snake.vector.y = 0;
  }
}

function handleMoveDown() {
  if (!inputEnabled) {
    return;
  }
  if (!alive) {
    resetGame();
  }
  if (snake.tail.length === 1 || snake.tail[1].y <= snake.y) {
    snake.vector.x = 0;
    snake.vector.y = 1;
  }
}

function handleInput(e) {
  e.preventDefault();
  switch (e.keyCode) {
    case 37:
      handleMoveLeft();
      break;
    case 38:
      handleMoveUp();
      break;
    case 39:
      handleMoveRight();
      break;
    case 40:
      handleMoveDown();
      break;
  }
}

function draw() {
  if (!alive) {
    drawGameOver();
    return;
  }

  if (!sceneDrawn) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBorders();
    sceneDrawn = true;
  }

  if (!treatDrawn) {
    drawTreat();
    treatDrawn = true;
  }

  if (!snakeDrawn) {
    drawSnake();
    snakeDrawn = true;
  } else {
    redrawSnake();
  }

  //drawDebugGrid();
}

setInterval(() => {
  update();
  draw();
}, updateInterval);

document.addEventListener("keydown", handleInput);
