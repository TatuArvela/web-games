/*
* Globals
* */

const canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
const context = canvas.getContext('2d');

const fps = 100;
const gameSpeed = 3;
const ballSpeedIncrease = 1.1;


/*
* Objects
* */

function PlayerPaddle(x, y, height = 80, width = 10, score = 0) {
  this.x = x;
  this.y = y;
  this.height = height;
  this.width = width;
  this.score = score
}

function Ball(x, y, size) {
  this.x = x;
  this.y = y;
  this.size = size;
  // speedX;
  // speedY;
}


/*
* Functions
* */

function getStartingSpeed() {
  const speeds = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1]
  ];
  const random = Math.floor(Math.random() * 4);
  return speeds[random];
}

function resetBall(ball) {
  const [speedX, speedY] = getStartingSpeed();

  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speedX = speedX * gameSpeed;
  ball.speedY = speedY * gameSpeed;
}

function detectCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.w &&
    rect1.x + rect1.w > rect2.x &&
    rect1.y < rect2.y + rect2.h &&
    rect1.h + rect1.y > rect2.y;
}

function detectPaddleCollision(ball, paddle) {
  const grace = ball.size;
  return detectCollision({
    x: ball.x,
    y: ball.y,
    w: ball.size,
    h: ball.size
  }, {
    x: paddle.x,
    y: paddle.y - grace,
    w: paddle.width,
    h: paddle.height + grace
  });
}

function calculateBounce(surface, collider) {
  return (surface - collider) * 2;
}

function controlGame(ball, player1, player2) {
  // Ball hits player 1
  if (detectPaddleCollision(ball, player1)) {
    ball.x += calculateBounce(player1.x + player1.width, ball.x);
    ball.speedX = Math.abs(ball.speedX * ballSpeedIncrease);
  }

  // Ball hits player 2
  if (detectPaddleCollision(ball, player2)) {
    ball.x += calculateBounce(player2.x, ball.x + ball.size);
    ball.speedX = -Math.abs(ball.speedX * ballSpeedIncrease);
  }

  ball.x += ball.speedX;
  ball.y += ball.speedY;

  // Ball hits the left edge
  if (ball.x < 0) {
    player2.score++;
    resetBall(ball);
  }

  // Ball hits the right edge
  if (ball.x + ball.size > canvas.width) {
    player1.score++;
    resetBall(ball);
  }

  // Ball hits the ceiling
  if (ball.y < 0) {
    ball.y += calculateBounce(0, ball.y);
    ball.speedY = Math.abs(ball.speedY * ballSpeedIncrease);
  }

  // Ball hits the floor
  if (ball.y + ball.size > canvas.height) {
    ball.y += calculateBounce(canvas.height, ball.y + ball.size);
    ball.speedY = -Math.abs(ball.speedY * ballSpeedIncrease);
  }
}

function movePlayer(paddle, event) {
  const rect = canvas.getBoundingClientRect();
  paddle.y = event.clientY - rect.top - paddle.height / 2;

  if (paddle.y < 0) {
    paddle.y = 0;
  } else if (paddle.y > canvas.height - paddle.height) {
    paddle.y = canvas.height - paddle.height;
  }
}

function moveAI(ball, paddle, maxSpeed) {
  const maxY = canvas.height - paddle.height;

  const paddleTop = paddle.y;
  const paddleBottom = paddle.y + paddle.height;

  const shouldMove = ball.x > canvas.width * (2 / 5);
  const willHitBall = (ball.y + ball.size * 2 > paddleTop) && (ball.y - ball.size < paddleBottom);

  if (!shouldMove || willHitBall) {
    return;
  }

  if (ball.y < paddleTop) {
    const requiredMove = paddleTop - ball.y;
    paddle.y -= Math.min(Math.abs(requiredMove), maxSpeed);
  }

  if (ball.y > paddleBottom) {
    const requiredMove = ball.y - paddleBottom;
    paddle.y += Math.min(requiredMove, maxSpeed);
  }

  if (paddle.y < 0) {
    paddle.y = 0;
  }

  if (paddle.y > maxY) {
    paddle.y = maxY;
  }
}

function draw(ball, player1, player2) {
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = 'white';
  context.fillRect(player1.x, player1.y, player1.width, player1.height);
  context.fillRect(player2.x, player2.y, player2.width, player2.height);
  context.fillRect(ball.x, ball.y, ball.size, ball.size);

  const fontWidth = 40;
  context.font = `${fontWidth}px 'Press Start 2P'`;
  context.fillText(player1.score, 300 - fontWidth, 100);
  context.fillText(player2.score, (canvas.width - 300), 100);
}


/*
* Main
* */

function pong() {
  const player1 = new PlayerPaddle(20, 10);
  const player2 = new PlayerPaddle(canvas.width - 10 - 20, 10);
  const ball = new Ball(canvas.width / 2, canvas.height / 2, 10);
  const aiMaxSpeed = gameSpeed * 4;

  function update() {
    controlGame(ball, player1, player2);
    moveAI(ball, player2, aiMaxSpeed);
    draw(ball, player1, player2);
  }

  resetBall(ball);
  setInterval(update, 1000 / fps);

  canvas.addEventListener('mousemove', function (event) {
    movePlayer(player1, event);
  })
}

pong();
