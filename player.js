const player = document.getElementById("player");
const iframe = document.getElementById("iframe");
let gameUrl;

function exitGame() {
  player.classList.add("disabled");
  iframe.removeAttribute("onload");
  iframe.removeAttribute("src");
  document.activeElement.blur();
  resetScreensaverTimeout();
}

function play(game) {
  gameUrl = game.url;

  if (game.isExternal) {
    window.location.href = game.url;
    return;
  }

  player.classList.remove("disabled");
  iframe.setAttribute("onload", "iframe.contentWindow.focus()");
  iframe.setAttribute("src", game.url);
  clearTimeout(screensaverTimeout);
}

function toggleFullscreen() {
  return document.fullscreenElement
    ? document.exitFullscreen()
    : document.documentElement.requestFullscreen({ navigationUI: "show" });
}

function popOut() {
  window.open(gameUrl, '_blank').focus();
}
