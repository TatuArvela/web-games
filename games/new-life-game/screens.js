// Builds and mounts every top-level screen.
//
// index.html is intentionally minimal — at startup, mountScreens() appends
// one <section id="screen-…"> per screen to <body>. engine.js then drives
// navigation by showing/hiding sections via goToScreen().
//
// Static screens use innerHTML templates. Data-driven screens (character
// select cards, confirm bio) read from window.CHARACTERS so the HTML never
// drifts from characters.js.

function menuHtml() {
  return `
    <h1 class="title"><span class="new">New!</span> Life Game</h1>
    <div class="line line-1"></div>
    <div class="line line-2"></div>
    <div class="line line-3"></div>
    <div class="version">Version 0.0.2</div>
    <div class="subtitle">Why would they make this? 😩</div>
    <div class="start">
      <button class="button" onclick="goToScreen('select-character')">START GAME</button>
    </div>
    <div class="help">
      <button class="button" onclick="goToScreen('help')" id="help-button">HELP</button>
    </div>
    <div class="scenes">
      <button class="button" onclick="goToScreen('scenes')" disabled>SCENE SELECTION</button>
    </div>
    <div class="extras">
      <button class="button" onclick="goToScreen('extras')" disabled>EXTRAS</button>
    </div>
    <div class="true-ending">
      <button class="button" onclick="playScene('convergence')" disabled>TRUE ENDING</button>
    </div>
    <div class="locked">
      <span class="lock-icon">🔒</span>
      <span>PLAY THE GAME<br/>TO ACCESS THESE</span>
    </div>
  `;
}

function helpHtml() {
  return `
    <button class="back-button" onclick="goToScreen('menu')">⬅</button>
    <h1>HELP</h1>
    <span class="icon-left">📖</span>
    <span class="icon-right">📖</span>
    <ul>
      <li><b>Life Game</b> is a fun new game about a life</li>
      <li>The goal of <b>Life Game</b> is to live the life of a given character</li>
      <li>You may try to head for success, or destroy the life of the character</li>
      <li>Progress happens by clicking buttons on the screen, sometimes the buttons are hidden</li>
      <li>The game has various fun secrets to find, such as this help text</li>
      <li>Why are you reading this anyway?</li>
    </ul>
    <div class="error">
      <div>
        ERROR!<br/><br/>
        THERE IS NO HELP FOR YOU<br/><br/>
        <b>Life Game</b> help was closed to prevent any spoilers to the player.<br/>
        It is unsafe to wander here. Press OK to return to the menu.<br/><br/>
        <button class="close-button" onclick="closeHelp()"><span>OK</span></button>
      </div>
    </div>
  `;
}

// Character cards are generated from CHARACTERS, so adding a new playable
// character only requires editing characters.js.
function selectCharacterHtml() {
  const intro = `
    <button class="back-button" onclick="goToScreen('menu')">⬅</button>
    <div class="instructions">
      <h1>CHARACTER SELECTION</h1>
      <p>Select a character.</p><br/>
      <p>Your goal is to make your character intelligent, wealthy and fit.</p><br/>
      <p>You can raise your intelligence by buying (or stealing) intelligence books.</p><br/>
      <p>Money can be obtained by working or selling found items.</p><br/>
      <p>Fitness can be improved by exercising.</p><br/>
      <p>You win the game once your character has all of these stats maxed out.</p><br/>
      <p>The game has lots of hidden clickable things, so keep your eyes open.</p>
    </div>
  `;
  const stat = (v) =>
    v > 0
      ? '<div class="plus">+</div>'
      : '<div class="minus">-</div>';
  const cards = ["bob", "willie", "peter"]
    .map((key) => {
      const ch = window.CHARACTERS[key];
      return `
        <button class="character" onclick="showConfirm('${ch.id}')">
          <h2>${ch.name}</h2>
          <p>Age ${ch.age}</p>
          <div class="stats"><div>💡</div><div>💰</div><div>💪</div></div>
          <div class="stat-values">
            ${stat(ch.statDeltas.intelligence)}
            ${stat(ch.statDeltas.money)}
            ${stat(ch.statDeltas.fitness)}
          </div>
        </button>
      `;
    })
    .join("");
  return intro + `<div class="characters">${cards}</div>`;
}

// Single confirm screen, populated per-character by showConfirm(). Replaces
// the three near-duplicate per-character confirm sections.
function confirmHtml(characterId) {
  const ch = window.CHARACTERS[characterId];
  if (!ch) return "";
  const upper = ch.shortName.toUpperCase();
  const bio = ch.bio.map((line) => `<li>${line}</li>`).join("");
  return `
    <button class="back-button" onclick="goToScreen('select-character')">⬅</button>
    <div class="details">
      <h1>You have selected <span class="name">${upper}</span></h1>
      <ul>${bio}</ul>
    </div>
    <img class="portrait" src="${ch.portrait}" alt="${ch.shortName}"/>
    <div class="confirm-button-container">
      <button class="common-button secondary" onclick="playScene('${ch.id}-game-over-indecisive')">Uhh what?</button>
      <button class="common-button" onclick="confirmCharacter('${ch.id}')">Confirm</button>
    </div>
  `;
}

function scenesHtml() {
  return `
    <button class="back-button" onclick="goToScreen('menu')">⬅</button>
    <h1>SCENE SELECTION</h1>
    <div class="character-toggle">
      <button class="char-tab" data-char="bob" onclick="selectScenesTab('bob')">Bob</button>
      <button class="char-tab" data-char="willie" onclick="selectScenesTab('willie')">Willie</button>
      <button class="char-tab" data-char="peter" onclick="selectScenesTab('peter')">Peter</button>
    </div>
    <div class="scene-tree"></div>
  `;
}

function extrasHtml() {
  return `
    <button class="back-button" onclick="goToScreen('menu')">⬅</button>
    <h1>EXTRAS</h1>
    <button class="tile" onclick="playScene('fight-intro')">
      <span class="tile-emoji">🥊</span>
      <span>Loser vs Jam Dude</span>
    </button>
  `;
}

function mountScreens() {
  const body = document.body;
  function make(id, html, className = "") {
    const sec = document.createElement("section");
    sec.id = "screen-" + id;
    if (className) sec.className = className;
    sec.innerHTML = html;
    body.appendChild(sec);
  }
  make("menu", menuHtml());
  make("help", helpHtml());
  make("select-character", selectCharacterHtml());
  make("confirm", "", "confirm-screen"); // populated by showConfirm()
  make("story", "");                      // populated by playScene()
  make("scenes", scenesHtml());
  make("extras", extrasHtml());
}

function showConfirm(characterId) {
  const sec = document.querySelector("#screen-confirm");
  if (!sec) return;
  sec.innerHTML = confirmHtml(characterId);
  goToScreen("confirm");
}

window.mountScreens = mountScreens;
window.showConfirm = showConfirm;
