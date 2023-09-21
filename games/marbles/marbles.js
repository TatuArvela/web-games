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

const ballRadius = 12;

let nextIdentifier = 1;
function getNextIdentifier() {
  return nextIdentifier && nextIdentifier++;
}

function Ball(x, y, color, identifier) {
  this.identifier = identifier ?? getNextIdentifier();
  this.x = x;
  this.y = y;
  this.speedX = 0;
  this.speedY = 0;
  this.color = color;
  this.touched = false;
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

    ball1.touched = true;
    ball2.touched = true;
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

let balls = [
  new Ball(canvas.width / 6, canvas.height / 2, "#eee", "player"),
  new Ball(canvas.width / 4, (2 * canvas.height) / 7, "#77f"),
  new Ball(canvas.width / 4, (3 * canvas.height) / 7, "#94f"),
  new Ball(canvas.width / 4, (4 * canvas.height) / 7, "#b4e"),
  new Ball(canvas.width / 4, (5 * canvas.height) / 7, "#48f"),
  new Ball((2 * canvas.width) / 4, (2 * canvas.height) / 7, "#ba0"),
  new Ball((2 * canvas.width) / 4, (3 * canvas.height) / 7, "#ba0"),
  new Ball((2 * canvas.width) / 4, (4 * canvas.height) / 7, "#ba0"),
  new Ball((2 * canvas.width) / 4, (5 * canvas.height) / 7, "#ba0"),
  new Ball((3 * canvas.width) / 4, (2 * canvas.height) / 7, "#d64"),
  new Ball((3 * canvas.width) / 4, (3 * canvas.height) / 7, "#c80"),
  new Ball((3 * canvas.width) / 4, (4 * canvas.height) / 7, "#ba0"),
  new Ball((3 * canvas.width) / 4, (5 * canvas.height) / 7, "#c59"),
];
function getPlayerBall() {
  return balls.find((ball) => ball.identifier === "player");
}

const minX = 0 + ballRadius;
const maxX = canvas.width - ballRadius;
const minY = 0 + ballRadius;
const maxY = canvas.height - ballRadius;

function update() {
  balls.forEach((ball) => {
    moveBall(ball);
  });
  for (let i = 0; i < balls.length; i++) {
    for (let j = 0; j < balls.length; j++) {
      if (i !== j) {
        collideBalls(balls[i], balls[j]);
      }
    }
  }
  balls.forEach((ball) => bounceBallOnEdges(ball));
}

function drawGrass() {
  context.fillStyle = "#060";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBall(ball) {
  context.beginPath();
  context.arc(ball.x, ball.y, ballRadius, 0, 2 * Math.PI, false);
  context.fillStyle = ball.touched ? "white" : ball.color;
  context.fill();
}

function getAbsDistance(a, b) {
  return Math.abs(a > b ? a - b : b - a);
}

function drawLine() {
  const playerBall = getPlayerBall();
  context.beginPath();
  context.moveTo(playerBall.x, playerBall.y);
  context.strokeStyle = "blue";
  context.lineWidth = 3;
  const [x, y] = mouseMovePosition;
  context.lineTo(x, y);
  context.stroke();
}

function draw() {
  drawGrass();
  if (isMouseDown && !getPlayerBall().touched) {
    drawLine();
  }
  balls.forEach((ball) => {
    drawBall(ball);
  });
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
  if (getPlayerBall().touched) {
    return;
  }
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
      const playerBall = getPlayerBall();
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

// # TODO
// Generate random ball positions
// Count and show score
// Restart button
// Allow multiple moves
// Level system (increase amount of balls, decrease amount of moves)
// Random, unique ball colors
// Allow starting move from any ball
// "Level Complete!" splash
