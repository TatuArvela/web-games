let games = [];
const IDLE_TIME = 60000;
const GAME_RENDER_LIMIT = 11;

const launcherElement = document.getElementById("launcher");
const gamesElement = document.getElementById("games");
const titleElement = document.getElementById("title");
let screensaverElement;

const moveDuration = parseInt(
  getComputedStyle(document.documentElement)
    .getPropertyValue("--move-duration")
    .replace("ms", "")
);

let selectedIndex = 0;
let animation = "";
let moveTimeout = null;
let screensaverTimeout;

function getGamesToRender() {
  const renderedGames = [];
  const renderedPerSide = (GAME_RENDER_LIMIT - 1) / 2;

  for (let offset = -renderedPerSide; offset <= renderedPerSide; offset++) {
    let gameIndex = (selectedIndex + offset + games.length) % games.length;
    renderedGames.push(games[gameIndex]);
  }

  return renderedGames;
}

function renderGames() {
  const fragment = document.createDocumentFragment();
  const selectedGame = games[selectedIndex];

  getGamesToRender().forEach((game) => {
    const isSelected = selectedGame.title === game.title;
    const gameElement = document.createElement("div");
    gameElement.className = [
      "game",
      animation,
      game.isIncomplete && "incomplete",
    ]
      .filter(Boolean)
      .join(" ");

    if (isSelected) {
      gameElement.id = "selected";
      gameElement.onclick = () => play(game);
    }

    // Image
    const imageContainer = document.createElement("div");
    imageContainer.className = "game-image";
    let imageElement;
    if (game.image) {
      imageElement = document.createElement("img");
      imageElement.src = game.image;
    } else {
      imageElement = document.createElement("div");
      imageElement.className = "image-placeholder";
      imageElement.innerText = game.title;
    }
    imageContainer.appendChild(imageElement);

    // Details
    const details = document.createElement("div");
    details.className = "game-details";

    // Controls
    const controls = document.createElement("div");
    controls.className = "game-controls";
    game.controls.forEach((control) => {
      const controlIcon = document.createElement("img");
      controlIcon.src = `img/${control}.png`;
      controls.appendChild(controlIcon);
    });
    details.appendChild(controls);

    // Players
    const players = document.createElement("div");
    players.className = "game-players";
    players.innerText = `${game.players}P`;
    details.appendChild(players);

    gameElement.appendChild(imageContainer);
    gameElement.appendChild(details);
    fragment.appendChild(gameElement);
  });

  gamesElement.innerHTML = "";
  gamesElement.appendChild(fragment);

  if (titleElement.innerText !== selectedGame.title) {
    titleElement.innerText = selectedGame.title;
  }
}

function debounce(func, delay = 0) {
  if (moveTimeout) {
    return;
  }

  func();

  moveTimeout = setTimeout(() => {
    moveTimeout = null;
  }, delay);
}

function previousGame() {
  animation = "move-previous";
  if (selectedIndex === 0) {
    selectedIndex = games.length - 1;
  } else {
    selectedIndex--;
  }
  renderGames();
  resetScreensaverTimeout();
}

function nextGame() {
  animation = "move-next";
  if (selectedIndex === games.length - 1) {
    selectedIndex = 0;
  } else {
    selectedIndex++;
  }
  renderGames();
  resetScreensaverTimeout();
}

function handleInput(e) {
  e.preventDefault();
  resetScreensaverTimeout();

  switch (e.keyCode) {
    case 37: // Left
      debounce(previousGame, moveDuration);
      break;
    case 39: // Right
      debounce(nextGame, moveDuration);
      break;
    case 32:
    case 13:
      play(games[selectedIndex]);
  }
}

function resetScreensaverTimeout() {
  clearTimeout(screensaverTimeout);
  screensaverTimeout = setTimeout(screensaver, IDLE_TIME);
  if (screensaverElement) {
    screensaverElement.remove();
  }
}

function screensaver() {
  screensaverElement = document.createElement("div");
  screensaverElement.style.position = "fixed";
  screensaverElement.style.width = "100%";
  screensaverElement.style.height = "100%";
  screensaverElement.onmousemove = resetScreensaverTimeout;

  const screensaverIframe = document.createElement("iframe");
  screensaverIframe.style.pointerEvents = "none";
  screensaverIframe.src = "https://tatuarvela.github.io/mystify.scr/";
  screensaverElement.appendChild(screensaverIframe);

  document.body.appendChild(screensaverElement);
}

async function launcher() {
  games = await fetch("./games.json")
    .then((response) => response.json())
    .then((data) => data.games);

  renderGames();
  resetScreensaverTimeout();

  document.addEventListener("keydown", handleInput);
}

launcher();
