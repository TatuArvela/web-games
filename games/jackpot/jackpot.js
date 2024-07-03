const canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 600;
const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;
const updateIntervalMs = 10;

class Drum {
  constructor(id) {
    this.id = id;
  }
}

const topOffset = 48;
const drums = Array.from({length: 3}, () => new Drum());

function update() {
}

function drawDrums() {
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "rgb(38,8,8,1)");
  gradient.addColorStop(0.3, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(0.7, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgb(38,8,8,1)");

  drums.forEach((drum, index) => {
    context.fillStyle = `rgb(245, 255, 251)`;
    context.fillRect((canvas.width - 100) / 3 * index + 50, 60 + topOffset, (canvas.width - 100) / 3, canvas.height - 120);

    context.fillStyle = gradient;
    context.fillRect((canvas.width - 100) / 3 * index + 50, 60 + topOffset, (canvas.width - 100) / 3, canvas.height - 120);
  });
}

function drawRoundedRect(x, y, width, height, radius) {
  const offset = context.lineWidth / 2;
  context.beginPath();
  context.moveTo(x + radius + offset, y + offset);
  context.arcTo(x + width - offset, y + offset, x + width - offset, y + height - offset, radius);
  context.arcTo(x + width - offset, y + height - offset, x + offset, y + height - offset, radius);
  context.arcTo(x + offset, y + height - offset, x + offset, y + offset, radius);
  context.arcTo(x + offset, y + offset, x + width - offset, y + offset, radius);
  context.closePath();
}

function drawFrame() {
  context.lineWidth = 10;
  context.strokeStyle = "rgb(197,113,26)";
  drums.forEach((drum, index) => {
    context.beginPath();
    context.rect((canvas.width - 100) / 3 * index + 50, 50 + topOffset, (canvas.width - 100) / 3, canvas.height - topOffset - 100);
    context.closePath();
    context.stroke();
  });

  context.lineWidth = 30;
  context.strokeStyle = "rgb(255,193,0)";
  drawRoundedRect(0, topOffset, canvas.width, canvas.height - topOffset, 30);
  context.stroke();

  context.lineWidth = 20;
  context.strokeStyle = "rgb(227,51,51)";
  drawRoundedRect(20, 20 + topOffset, canvas.width - 40, canvas.height - topOffset - 40, 20);
  context.stroke();

  context.lineWidth = 30;
  context.strokeStyle = "rgb(250,190,50)";
  drawRoundedRect(30, 30 + topOffset, canvas.width - 60, canvas.height - topOffset - 60, 10);
  context.stroke();

  context.lineWidth = 10;
  context.strokeStyle = "rgb(197,113,26)";
  drawRoundedRect(50, 50 + topOffset, canvas.width - 100, canvas.height - topOffset - 100, 10);
  context.stroke();
}

function drawLogo() {
  context.fillStyle = "rgb(255,193,0)";
  context.beginPath();
  context.fillRect(canvas.width / 2 - 220, 10, 440, 78);
  context.closePath();
  context.stroke();

  context.lineWidth = 20;
  context.strokeStyle = "rgb(255,193,0)";
  drawRoundedRect(canvas.width / 2 - 230, 0, 460, 98, 20);
  context.stroke();

  context.font = "70px Ultra";
  context.textAlign = "center";
  context.textBaseline = "top";

  context.lineJoin = 'round';
  context.strokeWidth = 10;
  context.strokeStyle = "rgb(52,28,1)";
  context.strokeText("JACKPOT", canvas.width / 2 - 3, 13);

  context.fillStyle = "white";
  context.fillText("JACKPOT", canvas.width / 2, 10);
}

function drawScore() {
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawDrums();
  drawFrame();
  drawLogo();
  drawScore();

  requestAnimationFrame(draw);
}

setInterval(() => update(), updateIntervalMs);
requestAnimationFrame(draw);

/* TODO:
* Spinning drums
* Symbols
* Odds
* Add wins table
* Add coin slot and lever
* Add coin counter
*/
