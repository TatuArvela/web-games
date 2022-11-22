/*
 * Globals
 * */

const canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 600;
const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;

const updateRate = 100;
const frameRate = 60;

const ballRadius = 20;

function Ball(x, y, color) {
  this.x = x;
  this.y = y;
  this.speedX = 0;
  this.speedY = 0;
  this.color = color;
}

let isMouseDown = false;
let mouseMovePosition = null;

const maxVectorLength = 50;
const slowDownRate = 0.005;

function moveBall(ball) {
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

function collideBalls(ball1, ball2) {
  function ballIntersect(ball1, ball2) {
    return (
      (ball1.x - ball2.x) * (ball1.x - ball2.x) +
        (ball1.y - ball2.y) * (ball1.y - ball2.y) <=
      (ballRadius + ballRadius) * (ballRadius + ballRadius)
    );
  }

  if (ballIntersect(ball1, ball2)) {
    const vCollision = { x: ball2.x - ball1.x, y: ball2.y - ball1.y };
    const distance = Math.sqrt(
      (ball2.x - ball1.x) * (ball2.x - ball1.x) +
        (ball2.y - ball1.y) * (ball2.y - ball1.y)
    );
    const vCollisionNorm = {
      x: vCollision.x / distance,
      y: vCollision.y / distance,
    };
    const vRelativeVelocity = {
      x: ball1.speedX - ball2.speedX,
      y: ball1.speedY - ball2.speedY,
    };
    const speed =
      vRelativeVelocity.x * vCollisionNorm.x +
      vRelativeVelocity.y * vCollisionNorm.y;

    if (speed < 0) {
      return;
    }

    ball1.speedX -= speed * vCollisionNorm.x;
    ball1.speedY -= speed * vCollisionNorm.y;
    ball2.speedX += speed * vCollisionNorm.x;
    ball2.speedY += speed * vCollisionNorm.y;
  }
}

function bounceBallOnEdges(ball) {
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

/*
 * State
 * */

let playerBall = new Ball(canvas.width / 2, canvas.height / 2, "#eee");
let otherBalls = [
  new Ball(canvas.width / 4, (1 * canvas.height) / 5, "#48f"),
  new Ball(canvas.width / 4, (2 * canvas.height) / 5, "#77f"),
  new Ball(canvas.width / 4, (3 * canvas.height) / 5, "#94f"),
  new Ball(canvas.width / 4, (4 * canvas.height) / 5, "#b4e"),
  new Ball((3 * canvas.width) / 4, (1 * canvas.height) / 5, "#c59"),
  new Ball((3 * canvas.width) / 4, (2 * canvas.height) / 5, "#d64"),
  new Ball((3 * canvas.width) / 4, (3 * canvas.height) / 5, "#c80"),
  new Ball((3 * canvas.width) / 4, (4 * canvas.height) / 5, "#ba0"),
];

const minX = 0 + ballRadius;
const maxX = canvas.width - ballRadius;
const minY = 0 + ballRadius;
const maxY = canvas.height - ballRadius;

function update() {
  moveBall(playerBall);
  otherBalls.forEach((ball) => moveBall(ball));
  const allBalls = [playerBall, ...otherBalls];
  for (let i = 0; i < allBalls.length; i++) {
    for (let j = 0; j < allBalls.length; j++) {
      if (i !== j) {
        collideBalls(allBalls[i], allBalls[j]);
      }
    }
  }
  bounceBallOnEdges(playerBall);
  otherBalls.forEach((ball) => bounceBallOnEdges(ball));
}

function drawGrass() {
  context.fillStyle = "#060";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBall(ball) {
  context.beginPath();
  context.arc(ball.x, ball.y, ballRadius, 0, 2 * Math.PI, false);
  context.fillStyle = ball.color;
  context.fill();
}

function getAbsDistance(a, b) {
  return Math.abs(a > b ? a - b : b - a);
}

function drawLine() {
  context.beginPath();
  context.moveTo(playerBall.x, playerBall.y);
  context.strokeStyle = "blue";
  context.lineWidth = 5;
  const [x, y] = mouseMovePosition;

  context.lineTo(x, y);
  context.stroke();
}

function draw() {
  drawGrass();
  if (isMouseDown) {
    drawLine();
  }
  drawBall(playerBall);
  otherBalls.forEach((ball) => drawBall(ball));
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

canvas.addEventListener("mousedown", function (downEvent) {
  isMouseDown = true;
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
      isMouseDown = false;
      const xSign = playerBall.x > mouseMovePosition[0] ? 1 : -1;
      const ySign = playerBall.y > mouseMovePosition[1] ? 1 : -1;
      playerBall.speedX +=
        (xSign * getAbsDistance(playerBall.x, mouseMovePosition[0])) / 10;
      playerBall.speedY +=
        (ySign * getAbsDistance(playerBall.y, mouseMovePosition[1])) / 10;
      document.removeEventListener("mousemove", mousemoveEventListener);
    },
    { once: true }
  );
});
