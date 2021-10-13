/*
* Globals
* */

const canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
const context = canvas.getContext('2d');

const updateRate = 100;
const frameRate = 60;
const aiRate = 5;

const paddleWidth = 10;
const ballSpeedIncrease = 1.1;


/*
* Objects
* */

function Ball() {
  this.x = canvas.width / 2;
  this.y = canvas.height / 2;
  this.size = 10;
  this.speedX = 0;
  this.speedY = 0;
}

function PlayerPaddle(x, y) {
  this.x = x;
  this.y = y;
  this.height = 80;
  this.width = paddleWidth;
  this.score = 0;
}


/*
* Physics
* */

function reflectBall(ball, paddle) {
  function getSign(number) {
    return number > 0 ? 1 : -1;
  }

  function getAbsSpeedY(ballMidPoint, paddleMidPoint) {
    const distance = Math.floor(Math.abs(paddleMidPoint - ballMidPoint));

    if (distance >= 0 && distance <= 10) {
      return 1;
    }
    if (distance > 10 && distance <= 20) {
      return 2;
    }
    if (distance > 20 && distance <= 30) {
      return 3;
    }
    return 4;
  }

  const signX = -1 * getSign(ball.speedX);
  const absSpeedX = Math.min(Math.abs(ball.speedX * ballSpeedIncrease), paddleWidth);
  const speedX = signX * absSpeedX;

  const ballMidPoint = (ball.y + ball.size / 2);
  const paddleMidPoint = (paddle.y + paddle.height / 2);

  const signY = ballMidPoint < paddleMidPoint ? -1 : 1;
  const absSpeedY = getAbsSpeedY(ballMidPoint, paddleMidPoint);
  const speedY = signY * absSpeedY;

  ball.speedX = speedX;
  ball.speedY = speedY;
}

function detectCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.w &&
    rect1.x + rect1.w > rect2.x &&
    rect1.y < rect2.y + rect2.h &&
    rect1.h + rect1.y > rect2.y;
}

function detectPaddleCollision(ball, paddle) {
  return detectCollision({
    x: ball.x,
    y: ball.y,
    w: ball.size,
    h: ball.size
  }, {
    x: paddle.x,
    y: paddle.y,
    w: paddle.width,
    h: paddle.height
  });
}

function calculateBounce(surface, collider) {
  return (surface - collider) * 2;
}

function moveBall(ball, player1, player2) {
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  // Ball hits player 1
  if (detectPaddleCollision(ball, player1)) {
    ball.x += calculateBounce(player1.x + player1.width, ball.x);
    reflectBall(ball, player1);
  }

  // Ball hits player 2
  if (detectPaddleCollision(ball, player2)) {
    ball.x += calculateBounce(player2.x, ball.x + ball.size);
    reflectBall(ball, player2);
  }

  // Ball hits the ceiling
  if (ball.y < 0) {
    ball.y += calculateBounce(0, ball.y);
    ball.speedY = ball.speedY * -1;
  }

  // Ball hits the floor
  if (ball.y + ball.size > canvas.height) {
    ball.y += calculateBounce(canvas.height, ball.y + ball.size);
    ball.speedY = ball.speedY * -1;
  }
}


/*
* Game logic
* */

function resetBall(ball) {
  function randomMinusOrPlus() {
    return Math.random() < 0.5 ? -1 : 1;
  }

  function randomSpeedY() {
    return Math.floor(Math.random() * 6) / 2;
  }

  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speedX = randomMinusOrPlus() * 3;
  ball.speedY = randomMinusOrPlus() * randomSpeedY();
}

function update(ball, player1, player2) {
  moveBall(ball, player1, player2);

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

function moveAi(ball, paddle) {
  const shouldMove = ball.x > (canvas.width / 2);
  if (!shouldMove) {
    return;
  }

  const paddleCenter = paddle.y + paddle.height / 2;

  if (ball.y < paddleCenter) {
    const requiredMove = paddleCenter - ball.y;
    paddle.y -= Math.abs(requiredMove);
  }

  if (ball.y > paddleCenter) {
    const requiredMove = ball.y - paddleCenter;
    paddle.y += requiredMove;
  }

  if (paddle.y < 0) {
    paddle.y = 0;
  }

  const maxY = canvas.height - paddle.height;
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
  const ball = new Ball();
  resetBall(ball);

  const player1 = new PlayerPaddle(20, 10);
  const player2 = new PlayerPaddle(canvas.width - 10 - 20, 10);

  setInterval(() => update(ball, player1, player2), 1000 / updateRate);
  setInterval(() => draw(ball, player1, player2), 1000 / frameRate)
  setInterval(() => moveAi(ball, player2), 1000 / aiRate)

  canvas.addEventListener('mousemove', function (event) {
    movePlayer(player1, event);
  })
}

pong();
