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
let gridHistory = [];
let hoveredTiles = [];
let shouldDraw;
let score = 0;
let scoreHistory = [];
let gameOver = false;
let win = false;


/*
* Game logic
* */

// TODO: Ensure playability
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

function getResult() {
  if (win) {
    return "You Win!";
  }
  if (gameOver) {
    return "Game Over!";
  }
  return "";
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

function countGet(tiles) {
  return tiles.length > 1 ? tiles.length : 0;
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

function dropTiles() {
  const findFreeRow = (row, column) => {
    for (let i = row; i < rows - 1; i++) {
      if (grid[i + 1][column]) {
        return i;
      }
    }
    return rows - 1;
  }

  // Iterate columns left to right, rows down to up
  for (let column = 0; column < columns; column++) {
    for (let row = rows - 2; row >= 0; row--) {
      const color = grid[row][column];
      const belowRow = getBelowCoordinates(row, column)[0];
      if (!getColor(belowRow, column)) {
        const freeRow = findFreeRow(row, column);
        grid[row][column] = '';
        grid[freeRow][column] = color;
      }
    }
  }
}

function snapTiles() {
  const lastRow = rows - 1;
  const findFreeColumn = (column) => {
    for (let i = column; i > 0; i--) {
      if (grid[lastRow][i - 1]) {
        return i;
      }
    }
    return 0;
  }

  for (let column = 1; column < columns; column++) {
    const color = grid[lastRow][column];
    const leftColumn = getLeftCoordinates(lastRow, column)[1];
    if (color && !getColor(lastRow, leftColumn)) {
      const freeColumn = findFreeColumn(column);
      for (let row = 0; row < rows; row++) {
        grid[row][freeColumn] = grid[row][column];
        grid[row][column] = '';
      }
    }
  }
}

function detectWin() {
  const tiles = [].concat.apply([], grid);
  win = tiles.every((tile) => tile === '');
  if (win) {
    shouldDraw = true;
  }
}

function detectGameOver() {
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const color = grid[row][column];
      if (color) {
        const getColorByCoordinates = ([row, column]) => getColor(row, column);
        const aboveColor = getColorByCoordinates(getAboveCoordinates(row, column));
        const rightColor = getColorByCoordinates(getRightCoordinates(row, column));
        const belowColor = getColorByCoordinates(getBelowCoordinates(row, column));
        const leftColor = getColorByCoordinates(getLeftCoordinates(row, column));
        if (color === aboveColor || color === rightColor || color === belowColor || color === leftColor) {
          return;
        }
      }
    }
  }
  gameOver = true;
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

function updateHoveredTiles(targetTiles) {
  const sortTiles = (a, b) => {
    if (a[0] < b[0]) {
      return 1;
    }
    if (a[0] > b[0]) {
      return -1
    }
    if (a[1] <= b[1]) {
      return 1;
    }
    if (a[1] > b[1]) {
      return -1;
    }
  }

  const tilesMatch = (tiles1, tiles2) => {
    const tiles1Flat = [].concat.apply([], tiles1)
    const tiles2Flat = [].concat.apply([], tiles2)
    return (tiles1Flat.length === tiles2Flat.length && tiles1Flat.every((value, index) => value === tiles2Flat[index]));
  }

  const newHoveredTiles = (!gameOver && targetTiles.length > 1) ? targetTiles.slice().sort(sortTiles) : [];
  if (!tilesMatch(newHoveredTiles, hoveredTiles)) {
    hoveredTiles = newHoveredTiles;
    shouldDraw = true;
  }
}

function saveCurrentGridToHistory() {
  const gridCopy = JSON.parse(JSON.stringify(grid));
  gridHistory.push(gridCopy);
  scoreHistory.push(score);
}

function undo() {
  if (gridHistory.length > 0) {
    grid = gridHistory.pop();
    score = scoreHistory.pop();
    shouldDraw = true;
  }
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
  const x = (column) * tileWidth + ((column + 1) * tileXMargin);
  const y = (row) * tileHeight + ((row + 1) * tileYMargin);
  const img = colorAssets[color];
  c.drawImage(img, x, y);
  if (hoveredTiles.find(([tileRow, tileColumn]) => tileRow === row && tileColumn === column)) {
    c.fillStyle = 'rgba(255, 255, 255, 0.2)';
    const bgX = x - tileXMargin / 2;
    const bgY = y - tileYMargin / 2;
    const bgWidth = tileWidth + tileXMargin;
    const bgHeight = tileHeight + tileYMargin;
    c.fillRect(bgX, bgY, bgWidth, bgHeight);
  }
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
      color && drawTile(rowIndex, columnIndex, color)
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
    document.getElementById('result').innerText = getResult();
    document.getElementById('undo').disabled = gridHistory.length === 0;
    getResult() ? document.getElementById('result').classList.add('result-visible') : document.getElementById('result').classList.remove('result-visible');
  }
}


/*
* Main
* */

function newGame() {
  generateGame();
  gridHistory = [];
  score = 0;
  scoreHistory = [];
  gameOver = false;
  win = false;
  shouldDraw = true;
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
    if (gameOver) {
      return;
    }
    const targetTiles = getConnectedTargetTiles(e);
    if (targetTiles.length > 1) {
      saveCurrentGridToHistory();
      saveCurrentScoreToHistory();
      clearTiles(targetTiles);
      dropTiles();
      snapTiles();
      detectGameOver();
      detectWin();
      updateHoveredTiles(getConnectedTargetTiles(e));
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    const targetTiles = getConnectedTargetTiles(e);
    (!gameOver && targetTiles.length > 0) ? canvas.classList.add('pointer') : canvas.classList.remove('pointer');
    updateHoveredTiles(targetTiles);
    document.getElementById('get').innerText = countGet(targetTiles).toString(10);
  })
}

initialize();
