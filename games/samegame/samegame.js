/*
* Globals
* */

const canvas = document.getElementById('canvas');
const c = canvas.getContext('2d');

const frameRate = 60;

const colors = ["red", "blue", "yellow", "green", "purple"];

const gamePadding = 10;

const elementWidth = 50;
const elementHeight = 50;

const elementXMargin = 4;
const elementYMargin = 4;

const rows = 10;
const columns = 14;

const gameWidth = (elementXMargin + elementWidth) * columns + elementXMargin;
const gameHeight = (elementYMargin + elementHeight) * rows + elementYMargin;


/*
* Canvas functions
* */

function updateCanvasSize() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

window.addEventListener('resize', () => {
  updateCanvasSize();
});


let grid;

function generateGame() {
  grid = [];
  for (let i = 1; i <= rows; i++) {
    const row = [];
    for (let j = 1; j <= columns; j++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      row.push(color);
    }
    grid.push(row);
  }
}

function drawElement(row, column, color) {
  const x = (column - 1) * elementWidth + (column * elementXMargin);
  const y = (row - 1) * elementHeight + (row * elementYMargin);
  const img = document.getElementById(color);
  c.drawImage(img, x, y);
}

function draw() {
  c.save();
  c.clearRect(0, 0, canvas.width, canvas.height);

  c.translate((canvas.width - gameWidth) / 2, (canvas.height - gameHeight) / 2);
  c.fillStyle = 'rgba(0, 0, 0, 0.3)';
  c.fillRect(0 - gamePadding, 0 - gamePadding, gameWidth + gamePadding * 2, gameHeight + gamePadding * 2);
  c.strokeStyle = 'white';
  c.strokeRect(0 - gamePadding, 0 - gamePadding, gameWidth + gamePadding * 2, gameHeight + gamePadding * 2);

  grid.forEach((row, rowIndex) => {
    row.forEach((color, columnIndex) => {
      drawElement(rowIndex + 1, columnIndex + 1, color)
    })
  })

  c.restore();
}


/*
* Main
* */

updateCanvasSize();
generateGame();
setInterval(() => draw(), 1000 / frameRate);
