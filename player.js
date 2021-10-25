const player = document.getElementById("player");
const iframe = document.getElementById("iframe");

function reset() {
  player.classList.add('disabled');
  iframe.src = undefined;
  iframe.setAttribute("onload", undefined);
  document.activeElement.blur();
}

function play(url) {
  player.classList.remove('disabled');
  iframe.setAttribute("onload", "iframe.contentWindow.focus()");
  iframe.src = url;
}
