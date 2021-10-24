const games = [
  {
    title: "Pong",
    href: "./pong",
    players: 1
  },
  {
    title: "Snake",
    href: "./snake",
    players: 1
  },
  {
    title: "Tic-Tac-Toe",
    href: "./tic-tac-toe",
    players: 2
  },
  {
    title: "Super Mathgame",
    href: "https://tatuarvela.github.io/Super-Mathgame",
    players: 1
  },
  {
    title: "Sudoku",
    href: "https://tatuarvela.github.io/Sudoku",
    players: 1
  },
];

let selectedIndex = 0;
const gamesElement = document.getElementById('games');
const titleElement = document.getElementById('title');

let animation = "";
const moveDuration = parseInt(
  getComputedStyle(document.documentElement)
    .getPropertyValue('--moveDuration')
    .replace('ms', '')
);
let moveTimeout = null;

function getGamesToRender() {
  let minus2 = selectedIndex - 2;
  if (minus2 < 0) {
    minus2 = games.length + minus2;
  }

  let minus1 = selectedIndex - 1;
  if (minus1 < 0) {
    minus1 = games.length + minus1;
  }

  let plus1 = selectedIndex + 1;
  if (plus1 > games.length - 1) {
    plus1 = plus1 - games.length;
  }

  let plus2 = selectedIndex + 2;
  if (plus2 > games.length - 1) {
    plus2 = plus2 - games.length;
  }

  return [
    games[minus2],
    games[minus1],
    games[selectedIndex],
    games[plus1],
    games[plus2],
  ]
}

function renderGames() {
  gamesElement.innerHTML = '';
  getGamesToRender().forEach((game) => {
    const isSelected = games[selectedIndex].title === game.title;
    const gameElement = document.createElement(isSelected ? "a" : "div");
    gameElement.className = ["game", animation].filter(Boolean).join(" ");

    if (isSelected) {
      gameElement.href = game.href;
    }

    const image = document.createElement("img");
    image.src = "test";

    const details = document.createElement("div");
    details.className = "game-details";

    const players = document.createElement("div");
    players.className = "game-players";
    players.innerText = `${game.players}P`;
    details.appendChild(players);

    gameElement.appendChild(image);
    gameElement.appendChild(details);
    gamesElement.appendChild(gameElement);
  });
  titleElement.innerText = games[selectedIndex].title;
}

function debounce(func, delay = 0) {
  if (moveTimeout) {
    return;
  }

  func();

  moveTimeout = setTimeout(() => {
    moveTimeout = null;
  }, delay)
}

function previousGame() {
  animation = "movePrevious";
  if (selectedIndex === 0) {
    selectedIndex = games.length - 1;
  } else {
    selectedIndex--;
  }
  renderGames();
}

function nextGame() {
  animation = "moveNext";
  if (selectedIndex === games.length - 1) {
    selectedIndex = 0;
  } else {
    selectedIndex++;
  }
  renderGames();
}

function handleInput(e) {
  e.preventDefault();

  switch (e.keyCode) {
    case 37: // Left
      debounce(previousGame, moveDuration);
      break;
    case 39: // Right
      debounce(nextGame, moveDuration);
      break;
    case 32:
    case 13:
      window.location.assign(games[selectedIndex].href);
  }
}

renderGames();
document.addEventListener("keydown", handleInput);
