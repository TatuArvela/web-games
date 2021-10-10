/*
* Globals
* */

const canvas = document.getElementById('canvas');
canvas.width = 504;
canvas.height = 288;
const context = canvas.getContext('2d');


/*
* State
*  */

const game = {
  width: 504,
  height: 288,
  scale: 24,
  speed: 10
};
game.columns = game.width / game.scale;
game.rows = game.height / game.scale;
game.score = 0;

const snake = {
  y: 10,
  x: 10,
  vector: {
    x: 0,
    y: 0,
  },
  trail: [],
  tail: 5
};

const bug = {};

const edges = {
  left: 1,
  right: (game.columns - 1) - 1,
  top: 1,
  bottom: (game.rows - 1) - 1
};


/*
* Functions
*  */

window.onload = function () {
  if ((game.width % game.scale) !== 0 || (game.height % game.scale) !== 0) {
    game.width -= (game.width % game.scale);
  }

  if ((game.height % game.scale) !== 0 || (game.height % game.scale) !== 0) {
    game.height -= (game.height % game.scale);
  }

  newBugPosition();

  context.imageSmoothingEnabled = false;
  context.filter = "blur(1px)";

  document.addEventListener("keydown", input);
  setInterval(update, 1000 / game.speed);
}

function reset() {
  snake.trail = [];
  snake.vector.x = 0;
  snake.vector.y = 0;
  snake.x = 10;
  snake.y = 10;
  game.score = 0;
  snake.tail = 5;
}

function update() {
  snake.x += snake.vector.x;
  snake.y += snake.vector.y;

  // Left edge
  if (snake.x < edges.left) {
    //snake.x = edges.right;
    reset();
  }

  // Right edge
  if (snake.x > edges.right) {
    //snake.x = edges.left;
    reset();
  }

  // Top edge
  if (snake.y < edges.top) {
    //snake.y = edges.bottom;
    reset();
  }

  // Bottom edge
  if (snake.y > edges.bottom) {
    //snake.y = edges.top;
    reset();
  }

  // If the snake bites their snake.tail, reset the snake.tail
  for (let i = 0; i < snake.trail.length; i++) {
    if (snake.trail[i].x === snake.x && snake.trail[i].y === snake.y) {
      reset();
    }
  }

  // Grow the tail
  snake.trail.push({
    x: snake.x,
    y: snake.y
  })
  while (snake.trail.length > snake.tail) {
    snake.trail.shift();
  }

  // If the snake eats the bug, generate a new bug
  if (bug.x === snake.x && bug.y === snake.y) {
    snake.tail++;
    game.score++;
    newBugPosition();
  }

  draw();
}

function newBugPosition() {
  bug.x = Math.floor(Math.random() * (edges.right - edges.left - 1) + edges.left);
  bug.y = Math.floor(Math.random() * (edges.bottom - edges.top - 1) + edges.top);
  // Making sure the bug doesn't spawn inside the snake
  for (let i = 0; i < snake.trail.length; i++) {
    if ((snake.trail[i].x === bug.x) && (snake.trail[i].y === bug.y)) {
      newBugPosition();
    }
  }
}

function draw() {
  const grd = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  grd.addColorStop(0, "#88b330");
  grd.addColorStop(0.2, "#84b005");
  grd.addColorStop(0.5, "#a1ce02");
  grd.addColorStop(0.9, "#90bc03");
  grd.addColorStop(1, "#add209");

  // Draw the background
  context.fillStyle = grd;
  context.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Draw the border
  context.fillStyle = "#263d00";
  context.fillRect(
    game.scale / 3,
    game.scale / 3,
    canvas.width - (game.scale / 3 * 2),
    canvas.height - (game.scale / 3 * 2)
  );

  // Draw inner background
  context.fillStyle = grd;
  context.fillRect(
    game.scale / 3 * 2,
    game.scale / 3 * 2,
    canvas.width - game.scale / 3 * 4,
    canvas.height - (game.scale / 3 * 4)
  );

  // Draw the snake
  context.fillStyle = "#263d00";
  for (let i = 0; i < snake.trail.length; i++) {
    context.fillRect(
      snake.trail[i].x * game.scale,
      snake.trail[i].y * game.scale,
      game.scale,
      game.scale
    );
  }

  // Draw the bug
  context.fillStyle = "#263d00";
  context.fillRect(
    bug.x * game.scale + (game.scale / 3),
    bug.y * game.scale,
    game.scale / 3,
    game.scale / 3
  );
  context.fillRect(
    bug.x * game.scale,
    bug.y * game.scale + (game.scale / 3),
    game.scale / 3,
    game.scale / 3
  );
  context.fillRect(
    bug.x * game.scale + (game.scale / 3 * 2),
    bug.y * game.scale + (game.scale / 3),
    game.scale / 3,
    game.scale / 3
  );
  context.fillRect(
    bug.x * game.scale + (game.scale / 3),
    bug.y * game.scale + (game.scale / 3 * 2),
    game.scale / 3,
    game.scale / 3
  );

  context.fillStyle = grd;
  let w = canvas.width / (game.scale / 3);
  for (let i = 0; i < w; i++) {
    context.fillRect(
      game.scale / 3 * i,
      0,
      game.scale / 3 / 12,
      canvas.height
    );
  }
  let h = canvas.width / (game.scale / 3);
  for (let i = 0; i < h; i++) {
    context.fillRect(
      0,
      game.scale / 3 * i,
      canvas.width,
      game.scale / 3 / 12
    );
  }
}

function input(e) {
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
