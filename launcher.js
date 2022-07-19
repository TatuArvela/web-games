const IDLE_TIME = 60000;
const GAME_RENDER_LIMIT = 11;

const launcherElement = document.getElementById('launcher');
const gamesElement = document.getElementById('games');
const titleElement = document.getElementById('title');
let screensaverElement;

const moveDuration = parseInt(
  getComputedStyle(document.documentElement)
    .getPropertyValue('--moveDuration')
    .replace('ms', '')
);

let selectedIndex = 0;
let animation = "";
let moveTimeout = null;
let screensaverTimeout;

function getGamesToRender() {
  let renderedGames = [];

  const renderedPerSide = (GAME_RENDER_LIMIT - 1) / 2;

  for (let i = renderedPerSide; i > 0; i--) {
    const gameIndex = selectedIndex - i;
    renderedGames.push(gameIndex < 0
      ? games[gameIndex + games.length]
      : games[gameIndex]
    );
  }
  
  renderedGames.push(games[selectedIndex]);

  for (let i = 1; i <= renderedPerSide; i++) {
    const gameIndex = selectedIndex + i;
    renderedGames.push(gameIndex > games.length - 1
      ? games[gameIndex - games.length]
      : games[gameIndex]
    );
  }

  return renderedGames;
}

function renderGames() {
  gamesElement.innerHTML = '';
  getGamesToRender().forEach((game) => {
    const isSelected = games[selectedIndex].title === game.title;
    const gameElement = document.createElement("div");
    gameElement.className = [
      "game",
      animation
    ].filter(Boolean).join(" ");

    if (isSelected) {
      gameElement.id = "selected";
      gameElement.onclick = () => play(game.href);
    }

    const imageContainer = document.createElement("div");
    imageContainer.className = "game-image";
    const image = document.createElement("img");
    image.src = game.image ?? '';
    imageContainer.appendChild(image);

    const details = document.createElement("div");
    details.className = "game-details";

    const controls = document.createElement("div");
    controls.className = "game-controls";
    game.controls.forEach((control) => {
      const controlIcon = document.createElement('img');
      controlIcon.src = `img/${control}.png`;
      controls.appendChild(controlIcon);
    });
    details.appendChild(controls);

    const players = document.createElement("div");
    players.className = "game-players";
    players.innerText = `${game.players}P`;
    details.appendChild(players);

    gameElement.appendChild(imageContainer);
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
      play(games[selectedIndex].href);
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

renderGames();
resetScreensaverTimeout();

document.addEventListener("keydown", handleInput);
