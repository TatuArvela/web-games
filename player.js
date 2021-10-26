const player = document.getElementById("player");
const iframe = document.getElementById("iframe");

function reset() {
  player.classList.add("disabled");
  iframe.removeAttribute("onload");
  iframe.removeAttribute("src");
  document.activeElement.blur();
}

function play(url) {
  player.classList.remove("disabled");
  iframe.setAttribute("onload", "iframe.contentWindow.focus()");
  iframe.setAttribute("src", url);
}
