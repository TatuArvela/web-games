/*
* Globals
* */

const canvas = document.getElementById('canvas');
canvas.width = 640;
canvas.height = 480;
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;

const fps = 10;


/*
* Structure
* */

let state = {
  actionText: "Click to start",
  grid: ['', '', '', '', '', '', '', '', ''],
  scoreO: 0,
  scoreX: 0,
  turn: 0,
  willRestart: true,
};
const boxes = [
  [60, 74],
  [180, 74],
  [300, 74],
  [60, 194],
  [180, 194],
  [300, 194],
  [60, 314],
  [180, 314],
  [300, 314]
];


/*
* Functions
* */

function resetGame() {
  state = {
    ...state,
    actionText: '',
    grid: ['', '', '', '', '', '', '', '', ''],
    turn: 0,
    willRestart: false,
  }
  if (!state.curr) {
    state.curr = "X";
  }
}

function clickOnBox(i) {
  let text = state.grid[i];
  if (text === '') {
    state.grid[i] = state.curr;
    endTurn();
  }
}

function endTurn() {
  state.turn++;
  checkVictoryCondition();
  switchPlayer();
}

function switchPlayer() {
  if (state.curr === 'O') {
    state.curr = 'X';
  } else {
    state.curr = 'O';
  }
}

function checkVictoryCondition() {
  const {grid, curr} = state;

  const victoryPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 9],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let i = 0; i < victoryPatterns.length; i++) {
    const [a, b, c] = victoryPatterns[i];
    if (grid[a] === curr && grid[b] === curr && grid[c] === curr) {
      return finishedGame();
    }
  }

  if (state.turn === 9 && !state.willRestart) {
    return finishedGame(true);
  }
}

function finishedGame(tie = false) {
  state.actionText = tie ? 'Tie. Click to restart' : 'Click to restart';
  state.willRestart = true;

  if (state.curr === 'X' && !tie) {
    state.scoreX++;
  } else if (!tie) {
    state.scoreO++;
  }
}

function getBox(x, y) {
  for (const i in boxes) {
    if (
      x >= boxes[i][0] &&
      x <= boxes[i][0] + 100 &&
      y >= boxes[i][1] &&
      y <= boxes[i][1] + 100
    ) {
      return i;
    }
  }
}

function getBoxForEvent(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return getBox(x, y);
}

function handleCanvasClickAreas(event) {
  const box = getBoxForEvent(event);
  box && clickOnBox(box);
}

function draw() {
  const {actionText, curr, scoreX, scoreO, grid} = state;

  context.fillStyle = '#4242e7';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = '#a5a5ff'
  context.strokeStyle = '#a5a5ff'
  context.lineWidth = 4;

  context.font = '24px "Press Start 2P"';
  context.textAlign = 'center';
  context.fillText('Tic-Tac-Toe', canvas.width / 2, 50);
  context.fillText(actionText, canvas.width / 2, 464);

  context.textAlign = 'left';
  const scoreXPos = 450;
  context.fillText(`P.X${curr === 'X' ? '<' : ''}`, scoreXPos, 104);
  context.fillText(`P.O${curr === 'O' ? '<' : ''}`, scoreXPos, 224);
  context.fillText(scoreX, scoreXPos, 144);
  context.fillText(scoreO, scoreXPos, 264);

  for (let i = 0; i < 9; i++) {
    context.strokeRect(boxes[i][0], boxes[i][1], 100, 100);
  }

  context.textAlign = 'center';
  context.font = '90px "Press Start 2P"';
  for (let i = 0; i < 9; i++) {
    context.fillText(grid[i], boxes[i][0] + 56, boxes[i][1] + 100);
  }
}

/*
* Main
* */

function ticTacToe() {
  canvas.addEventListener('mousemove', function (event) {
    if (getBoxForEvent(event)) {
      canvas.style.cursor = "crosshair";
    } else {
      canvas.style.cursor = "default";
    }
  });

  canvas.addEventListener('click', function (event) {
    if (state.willRestart) {
      resetGame();
    } else {
      handleCanvasClickAreas(event);
    }
  });

  setInterval(draw, 1000 / fps);
}

ticTacToe();
