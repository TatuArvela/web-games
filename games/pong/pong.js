/*
* Globals
* */

const canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;

const updateRate = 100;

const aiRate = 100;
const minAiSpeed = 2;
const maxAiSpeed = 8;
const getRandomAiSpeed = () => Math.floor((Math.random() * maxAiSpeed) + minAiSpeed);
let aiSpeed = getRandomAiSpeed();
let previousAiDirection = 'down';

const paddleHeight = 80;
const paddleWidth = 10;
const ballSize = 10;
const ballSpeedIncrease = 1.1;


/*
* Objects
* */

function Ball() {
  function randomMinusOrPlus() {
    return Math.random() < 0.5 ? -1 : 1;
  }

  function randomSpeedY() {
    return Math.floor(Math.random() * 6) / 2;
  }

  this.x = canvas.width / 2;
  this.y = canvas.height / 2;
  this.speedX = randomMinusOrPlus() * 3;
  this.speedY = randomMinusOrPlus() * randomSpeedY();
  this.size = ballSize;
}

function PlayerPaddle(x, y) {
  this.x = x;
  this.y = y;
  this.height = paddleHeight;
  this.width = paddleWidth;
  this.score = 0;
}


/*
* State
* */

let ball = new Ball();
const player1 = new PlayerPaddle(20, 10);
const player2 = new PlayerPaddle(canvas.width - 10 - 20, 10);


/*
* Physics
* */

function reflectBall(paddle) {
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

function detectPaddleCollision(paddle) {
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


/*
* Game logic
* */

function controlBall() {
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  // Ball hits player 1
  if (detectPaddleCollision(player1)) {
    ball.x += calculateBounce(player1.x + player1.width, ball.x);
    reflectBall(player1);
  }

  // Ball hits player 2
  if (detectPaddleCollision(player2)) {
    ball.x += calculateBounce(player2.x, ball.x + ball.size);
    reflectBall(player2);
    aiSpeed = getRandomAiSpeed();
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

  // Ball hits the left edge
  if (ball.x < 0) {
    player2.score++;
    ball = new Ball();
  }

  // Ball hits the right edge
  if (ball.x + ball.size > canvas.width) {
    player1.score++;
    ball = new Ball();
  }
}

function movePlayer(event) {
  const rect = canvas.getBoundingClientRect();
  const scale = canvas.clientHeight / canvas.height;
  player1.y = (event.clientY - rect.top) / scale - player1.height / 2;

  if (player1.y < 0) {
    player1.y = 0;
  } else if (player1.y > canvas.height - player1.height) {
    player1.y = canvas.height - player1.height;
  }
}

function moveAi() {
  const shouldMove = ball.x > (canvas.width / 2);
  if (!shouldMove) {
    return;
  }

  const player2Center = player2.y + player2.height / 2;

  if (ball.y < player2Center) {
    const requiredMove = player2Center - ball.y;
    player2.y -= Math.min(Math.abs(requiredMove), aiSpeed);
    if (previousAiDirection !== 'up') {
      aiSpeed = getRandomAiSpeed();
      previousAiDirection = 'up';
    }
  }

  if (ball.y > player2Center) {
    const requiredMove = ball.y - player2Center;
    player2.y += Math.min(requiredMove, aiSpeed);
    if (previousAiDirection !== 'down') {
      aiSpeed = getRandomAiSpeed();
      previousAiDirection = 'down';
    }
  }

  if (player2.y < 0) {
    player2.y = 0;
  }

  const maxY = canvas.height - player2.height;
  if (player2.y > maxY) {
    player2.y = maxY;
  }
}


/*
* Main
* */

function update() {
  controlBall();
}

function draw() {
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

  window.requestAnimationFrame(draw);
}

setInterval(() => update(), 1000 / updateRate);
setInterval(() => moveAi(), 1000 / aiRate);
window.requestAnimationFrame(draw);

canvas.addEventListener('mousemove', function (event) {
  movePlayer(event);
})
