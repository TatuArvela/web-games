const player = document.getElementById("player");
const iframe = document.getElementById("iframe");

function exitGame() {
  player.classList.add("disabled");
  iframe.removeAttribute("onload");
  iframe.removeAttribute("src");
  document.activeElement.blur();
  resetScreensaverTimeout();
}

function play(url) {
  player.classList.remove("disabled");
  iframe.setAttribute("onload", "iframe.contentWindow.focus()");
  iframe.setAttribute("src", url);
  clearTimeout(screensaverTimeout);
}

function toggleFullscreen() {
  return document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen({navigationUI: "show"});
}
