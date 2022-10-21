/*
* Globals
* */

const screenWidth = 84;
const screenHeight = 48;
const black = '#322917';

const scale = 9;
const canvasPadding = 22;

const canvas = document.getElementById('canvas');
canvas.width = screenWidth * scale + canvasPadding * 2;
canvas.height = screenHeight * scale + canvasPadding * 2;
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;
const scoreDisplay = document.getElementById('score');

const updateInterval = 100; // ms
const gameOverScreenInputGrace = 1500;
const hardBorders = true;

const borders = {
  top: 2,
  left: 2,
  right: screenWidth - 1,
  bottom: screenHeight - 1,
}
const playArea = {
  top: 4,
  right: screenWidth - 3,
  bottom: screenHeight - 3,
  left: 4,
};
const width = (playArea.right - playArea.left + 1) / 3;
const height = (playArea.bottom - playArea.top + 1) / 3;


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

  this.x = randomNumber(1, width);
  this.y = randomNumber(1, height);
}


/*
* State
* */

let alive = true;
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
  if (overlapsWithSnakeTail(treat)) {
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

const scaled = (value) => value * scale;

function drawDot(x, y, c = context) {
  c.fillStyle = black;
  c.fillRect(scaled(x) + 0.5, scaled(y) + 0.5, scaled(1) - 1, scaled(1) - 1);
}

let borderCache = null;

function drawBorders() {
  if (borderCache === null) {
    borderCache = document.createElement('canvas')
    const borderCacheContext = borderCache.getContext('2d');
    borderCache.width = canvas.width;
    borderCache.height = canvas.height;
    borderCacheContext.translate(canvasPadding - scale, canvasPadding - scale);
  
    function drawHorizontalLine(from, to, height) {
      for (let i = from; i <= to; i++) {
        drawDot(i, height, borderCacheContext);
      }
    }
    
    function drawVerticalLine(from, to, width) {
      for (let i = from; i <= to; i++) {
        drawDot(width, i, borderCacheContext);
      }
    }
  
    drawHorizontalLine(borders.left, borders.right, borders.top);
    drawHorizontalLine(borders.left, borders.right, borders.bottom);
    drawVerticalLine(borders.top + 1, borders.bottom - 1, borders.left);
    drawVerticalLine(borders.top + 1, borders.bottom - 1, borders.right);
  }
  context.drawImage(borderCache, 0, 0);
}

let snakeSectionCache = null;

function drawSnakeSection(x, y) {
  if (snakeSectionCache === null) {
    snakeSectionCache = document.createElement('canvas');
    const snakeSectionCacheContext = snakeSectionCache.getContext('2d');
    
    for (let xOffset = 0; xOffset <= 2; xOffset++) {
      for (let yOffset = 0; yOffset <= 2; yOffset++) {
        drawDot(xOffset, yOffset, snakeSectionCacheContext);
      }
    }
  }
  context.drawImage(snakeSectionCache, scaled(x * 3), scaled(y * 3));
}

function drawSnake() {
  for (let i = 0; i < snake.tail.length; i++) {
    const section = snake.tail[i];
    drawSnakeSection(section.x + 1, section.y + 1);
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
  const x = treat.x + 1;
  const y = treat.y + 1;
  context.drawImage(treatCache, scaled(x * 3), scaled(y * 3));
}


/*
* Main
* */

function resetGame() {
  snake = new Snake();
  alive = true;
  gameOverDrawn = false;
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
    snake.x = width;
  }

  // Snake hits right edge
  if (snake.x > width) {
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
    snake.y = height;
  }

  // Snake hits bottom edge
  if (snake.y > height) {
    if (hardBorders) {
      return endGame();
    }
    snake.y = 1;
  }

  // Snake bites their tail
  if (snake.tail.length > 1 && overlapsWithSnakeTail(snake)) {
    return endGame();
  }

  // Move tail
  snake.tail.unshift({
    x: snake.x,
    y: snake.y
  })
  while (snake.tail.length > snake.points) {
    snake.tail.pop();
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
  if (snake.vector.x !== 1) {
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
  if (snake.vector.y !== 1) {
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
  if (snake.vector.x !== -1) {
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
  if (snake.vector.y !== -1) {
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

  context.clearRect(0, 0, canvas.width, canvas.height);
  drawBorders();
  drawTreat();
  drawSnake();
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

setInterval(() => {
  update();
  draw();
}, updateInterval);

document.addEventListener("keydown", handleInput);
