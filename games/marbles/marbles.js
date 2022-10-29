/*
* Globals
* */

const canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;

const updateRate = 100;
const frameRate = 60;

const ballSize = 20;

function Ball() {
  this.x = canvas.width / 2;
  this.y = canvas.height / 2;
  this.speedX = 0;
  this.speedY = 0;
}

let isMouseDown = false;
let mouseMovePosition = null;

const maxVectorLength = 50;
const slowDownRate = 0.0025;

function controlBall() {
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  if (Math.abs(ball.speedX) < 0.1) {
    ball.speedX = 0;
  } else {
    ball.speedX = ball.speedX * (1 - slowDownRate);
  }

  if (Math.abs(ball.speedY) < 0.1) {
    ball.speedY = 0;
  } else {
    ball.speedY = ball.speedY * (1 - slowDownRate);
  }
}


/*
* State
* */

let ball = new Ball();


const minX = 0 + ballSize;
const maxX = canvas.width - ballSize;
const minY = 0 + ballSize;
const maxY = canvas.height - ballSize;

function update() {
  controlBall();

  if (ball.x < minX) {
    ball.speedX = ball.speedX * -1;
    ball.x = minX;
  }
  if (ball.x > maxX) {
    ball.speedX = ball.speedX * -1;
    ball.x = maxX;
  }

  if (ball.y < minY) {
    ball.speedY = ball.speedY * -1;
    ball.y = minY;
  }
  if (ball.y > maxY) {
    ball.speedY = ball.speedY * -1;
    ball.y = maxY;
  }
}

function drawGrass() {
  context.fillStyle = '#22dd22';
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBall() {
  context.beginPath();
  context.arc(ball.x, ball.y, ballSize, 0, 2 * Math.PI, false);
  context.fillStyle = 'white';
  context.fill();
}

function getAbsDistance(a, b) {
  return Math.abs(a > b ? a - b : b - a);
}

function drawLine() {
  context.beginPath();
  context.moveTo(ball.x, ball.y);
  context.strokeStyle = 'blue';
  context.lineWidth = 5;
  const [x, y] = mouseMovePosition;

  // TODO
  // const xDistance = getAbsDistance(ball.x, x);
  // const yDistance = getAbsDistance(ball.y, y);
  // const vectorLength = (xDistance + yDistance) / 2;
  // const scale = 1;

  context.lineTo(x, y);
  context.stroke();
}

function draw() {
  drawGrass();
  if (isMouseDown) {
    drawLine();
  }
  drawBall();
}

setInterval(() => update(), 1000 / updateRate);
setInterval(() => draw(), 1000 / frameRate);

function getCanvasEventPosition(event) {
  const rect = canvas.getBoundingClientRect();
  const scale = canvas.width / canvas.clientWidth;
  const x = (event.clientX - rect.left) * scale;
  const y = (event.clientY - rect.top) * scale;
  return [x, y];
}

canvas.addEventListener('mousedown', function (downEvent) {
  isMouseDown = true;
  mouseMovePosition = getCanvasEventPosition(downEvent);
  const mousemoveEventListener = document.addEventListener('mousemove', function (moveEvent) {
    mouseMovePosition = getCanvasEventPosition(moveEvent);
  });
  document.addEventListener('mouseup', function () {
    isMouseDown = false;
    const xSign = ball.x > mouseMovePosition[0] ? 1 : -1;
    const ySign = ball.y > mouseMovePosition[1] ? 1 : -1;
    ball.speedX += xSign * getAbsDistance(ball.x, mouseMovePosition[0]) / 10;
    ball.speedY += ySign * getAbsDistance(ball.y, mouseMovePosition[1]) / 10;
    document.removeEventListener('mousemove', mousemoveEventListener);
  }, { once: true })
});
