/*
* Globals
* */

const canvas = document.getElementById('canvas');
const c = canvas.getContext('2d');

const frameRate = 60;

const colors = ["red", "blue", "yellow", "green", "purple"];

const gamePadding = 10;

const tileWidth = 50;
const tileHeight = 50;

const tileXMargin = 4;
const tileYMargin = 4;

const rows = 10;
const columns = 14;

const gameWidth = (tileXMargin + tileWidth) * columns + tileXMargin;
const gameHeight = (tileYMargin + tileHeight) * rows + tileYMargin;


/*
* State
* */

const colorAssets = {};
let assetsLoaded = false;
let grid;
let shouldDraw;
let score = 0;


/*
* Game logic
* */

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

function countLeft() {
  let left = 0;
  for (const row of grid) {
    for (const column of row) {
      if (column) {
        left++;
      }
    }
  }
  return left;
}

const getColor = (row, column) => (grid[row] ? grid[row][column] : '') ?? '';

const clearTiles = (list) => {
  const clearTile = (row, column) => grid[row][column] = '';

  list.forEach(([row, column], index) => {
    clearTile(row, column);
    score += 10 * (index + 1);
  });
  shouldDraw = true;
}

function getConnectedTiles(row, column, color, list = []) {
  const isNewTile = (row, column, list) =>
    list.every(([itemRow, itemColumn]) => !(itemRow === row && itemColumn === column));

  const getMatching = ([row, column], color, list) => {
    const isMatchingColor = getColor(row, column) === color;
    if (isMatchingColor && isNewTile(row, column, list)) {
      return getConnectedTiles(row, column, color, list)
    }
    return [];
  }

  const pushUnique = (row, column) => {
    if (isNewTile(row, column, list)) {
      list.push([row, column]);
    }
  }

  pushUnique(row, column);

  const above = getMatching(getAboveCoordinates(row, column), color, list)
  above.forEach(([row, column]) => pushUnique(row, column));

  const right = getMatching(getRightCoordinates(row, column), color, list)
  right.forEach(([row, column]) => pushUnique(row, column));

  const below = getMatching(getBelowCoordinates(row, column), color, list)
  below.forEach(([row, column]) => pushUnique(row, column));

  const left = getMatching(getLeftCoordinates(row, column), color, list)
  left.forEach(([row, column]) => pushUnique(row, column));

  return list;
}

function getConnectedTargetTiles(e) {
  const target = getTargetTileCoordinates(e);
  if (target) {
    const [row, column] = target;
    const color = getColor(row, column);
    if (color) {
      return getConnectedTiles(row, column, color);
    }
  }
  return [];
}


/*
* Geometry
* */

function updateCanvasSize() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  shouldDraw = true;
}

const getGridLeftEdge = () => (canvas.width - gameWidth) / 2;
const getGridTopEdge = () => (canvas.height - gameHeight) / 2;

function getTargetTileCoordinates({clientX, clientY}) {
  const fromLeft = clientX - getGridLeftEdge();
  const fromTop = clientY - getGridTopEdge();
  if (fromLeft > 0 && fromTop > 0) {
    const column = Math.floor(fromLeft / (tileWidth + tileXMargin));
    const row = Math.floor(fromTop / (tileHeight + tileYMargin));
    if (column < columns && row < rows) {
      return ([row, column]);
    }
  }
}

const getAboveCoordinates = (row, column) => [row - 1, column];
const getRightCoordinates = (row, column) => [row, column + 1];
const getBelowCoordinates = (row, column) => [row + 1, column];
const getLeftCoordinates = (row, column) => [row, column - 1];


/*
* Graphics
* */

function loadAssets() {
  for (let color of colors) {
    const asset = document.createElement("img");
    asset.src = `assets/${color}.png`;
    colorAssets[color] = asset;
  }

  let assetLoadWatcher;
  assetLoadWatcher = setInterval(() => {
    const statuses = Object.values(colorAssets).map((asset) => asset.complete);
    shouldDraw = true;
    if (statuses.every(result => result)) {
      clearInterval(assetLoadWatcher);
      assetsLoaded = true;
    }
  }, 50);
}

function drawTile(row, column, color) {
  const x = (column - 1) * tileWidth + (column * tileXMargin);
  const y = (row - 1) * tileHeight + (row * tileYMargin);
  const img = colorAssets[color];
  c.drawImage(img, x, y);
}

function draw() {
  c.save();
  c.clearRect(0, 0, canvas.width, canvas.height);

  c.translate(getGridLeftEdge(), getGridTopEdge());
  c.fillStyle = 'rgba(0, 0, 0, 0.3)';
  c.fillRect(0 - gamePadding, 0 - gamePadding, gameWidth + gamePadding * 2, gameHeight + gamePadding * 2);
  c.strokeStyle = 'white';
  c.strokeRect(0 - gamePadding, 0 - gamePadding, gameWidth + gamePadding * 2, gameHeight + gamePadding * 2);

  grid.forEach((row, rowIndex) => {
    row.forEach((color, columnIndex) => {
      color && drawTile(rowIndex + 1, columnIndex + 1, color)
    })
  })

  c.restore();
  shouldDraw = false;
}

function drawController() {
  if (shouldDraw) {
    draw();
    document.getElementById('score').innerText = score.toString(10);
    document.getElementById('left').innerText = countLeft().toString(10);
  }
}


/*
* Main
* */

function newGame() {
  generateGame();
  score = 0;
}

function initialize() {
  loadAssets();
  updateCanvasSize();
  newGame();

  setInterval(() => drawController(), 1000 / frameRate);

  window.addEventListener('resize', () => {
    updateCanvasSize();
  });

  canvas.addEventListener('click', (e) => {
    const targetTiles = getConnectedTargetTiles(e);
    clearTiles(targetTiles);
  });

  canvas.addEventListener('mousemove', (e) => {
    const targetTiles = getConnectedTargetTiles(e);
    document.getElementById('get').innerText = targetTiles.length.toString(10);
  })
}

initialize();


// TODO:
// Move orbs down
// Set cursor to pointer if target tiles
