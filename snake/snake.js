/*
* Globals
* */

const screenWidth = 84;
const screenHeight = 48;
const black = '#322917';

const scale = 10;
const canvasPadding = 20;

const canvas = document.getElementById('canvas');
canvas.width = screenWidth * scale + canvasPadding * 2;
canvas.height = screenHeight * scale + canvasPadding * 2;
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;
const scoreDisplay = document.getElementById('score');

const tickRate = 8;
const hardBorders = false;

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
  this.tailLength = 1;
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

let snake = new Snake();
let treat = new Treat();


/*
* Functions
*  */

function resetSnake() {
  snake = new Snake();
}

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

function drawDot(x, y) {
  context.fillStyle = black;
  context.fillRect(scaled(x) + 0.5, scaled(y) + 0.5, scaled(1) - 1, scaled(1) - 1);
}

function drawHorizontalLine(from, to, height) {
  for (let i = from; i <= to; i++) {
    drawDot(i, height);
  }
}

function drawVerticalLine(from, to, width) {
  for (let i = from; i <= to; i++) {
    drawDot(width, i);
  }
}

function drawBorders() {
  drawHorizontalLine(borders.left, borders.right, borders.top);
  drawHorizontalLine(borders.left, borders.right, borders.bottom);
  drawVerticalLine(borders.top + 1, borders.bottom - 1, borders.left);
  drawVerticalLine(borders.top + 1, borders.bottom - 1, borders.right);
}

function drawSnakeSection(x, y) {
  for (let xOffset = 0; xOffset <= 2; xOffset++) {
    for (let yOffset = 0; yOffset <= 2; yOffset++) {
      drawDot(x + xOffset, y + yOffset);
    }
  }
}

function drawTreat() {
  const x = treat.x * 3;
  const y = treat.y * 3;
  drawDot(x + 1, y);
  drawDot(x, y + 1);
  drawDot(x + 2, y + 1);
  drawDot(x + 1, y + 2);
}


/*
* Main
* */

function update() {
  snake.x += snake.vector.x;
  snake.y += snake.vector.y;

  // Snake hits left edge
  if (snake.x < 1) {
    if (hardBorders) return resetSnake();
    snake.x = width;
  }

  // Snake hits right edge
  if (snake.x > width) {
    if (hardBorders) return resetSnake();
    snake.x = 1;
  }

  // Snake hits top edge
  if (snake.y < 1) {
    if (hardBorders) return resetSnake();
    snake.y = height;
  }

  // Snake hits bottom edge
  if (snake.y > height) {
    if (hardBorders) return resetSnake();
    snake.y = 1;
  }

  // Snake bites their tail
  if (snake.tail.length > 0 && overlapsWithSnakeTail(snake)) {
    return resetSnake();
  }

  // Grow the tail
  snake.tail.push({
    x: snake.x,
    y: snake.y
  })
  while (snake.tail.length > snake.tailLength) {
    snake.tail.shift();
  }

  // If the snake eats the treat, generate a new treat
  if (treat.x === snake.x && treat.y === snake.y) {
    snake.tailLength++;
    resetTreat();
  }
}

function handleInput(e) {
  switch (e.keyCode) {
    case 37: // Left
      if (snake.vector.x !== 1) {
        snake.vector.x = -1;
        snake.vector.y = 0;
      }
      break;
    case 38: // Up
      if (snake.vector.y !== 1) {
        snake.vector.x = 0;
        snake.vector.y = -1;
      }
      break;
    case 39: // Right
      if (snake.vector.x !== -1) {
        snake.vector.x = 1;
        snake.vector.y = 0;
      }
      break;
    case 40: // Down
      if (snake.vector.y !== -1) {
        snake.vector.x = 0;
        snake.vector.y = 1;
      }
      break;
  }
}

function draw() {
  context.save();
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Top left pixel is 1,1
  context.translate(canvasPadding - scale, canvasPadding - scale);
  drawBorders();
  context.translate(scale, scale);

  drawTreat();

  // Draw the snake
  context.fillStyle = "#263d00";
  for (let i = 0; i < snake.tail.length; i++) {
    const section = snake.tail[i];
    drawSnakeSection(section.x * 3, section.y * 3);
  }
  context.restore();
}

function displayScore() {
  scoreDisplay.innerText = snake.tailLength;
}

setInterval(() => {
  update();
  draw();
  displayScore();
}, 1000 / tickRate);

document.addEventListener("keydown", handleInput);
