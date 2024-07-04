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

const topMargin = 200;
const bottomMargin = 120;
const rightMargin = 120;

const frameWidth = canvas.width - rightMargin;
const frameHeight = canvas.height - topMargin - bottomMargin;

const drumsHorizontalMargin = 140;
const drumsVerticalMargin = 25;
const drumsWidth = frameWidth - (drumsHorizontalMargin * 2);
const drumsHeight = frameHeight - (drumsVerticalMargin * 2);
const drums = Array.from({length: 3}, () => new Drum());

function update() {
}

function drawRoundedRect(x, y, width, height, radius) {
  const offset = context.lineWidth / 2;
  const adjustedRadius = radius - offset;

  context.beginPath();
  context.moveTo(x + adjustedRadius + offset, y + offset);
  context.arcTo(x + width - offset, y + offset, x + width - offset, y + height - offset, adjustedRadius);
  context.arcTo(x + width - offset, y + height - offset, x + offset, y + height - offset, adjustedRadius);
  context.arcTo(x + offset, y + height - offset, x + offset, y + offset, adjustedRadius);
  context.arcTo(x + offset, y + offset, x + width - offset, y + offset, adjustedRadius);
  context.closePath();
}

function drawSignBase() {
  const gradient = context.createLinearGradient(0, 0, 0, 200);
  gradient.addColorStop(0, "rgb(8,10,38)");
  gradient.addColorStop(0.3, "rgb(21,26,75)");
  gradient.addColorStop(0.7, "rgb(38,50,201)");
  gradient.addColorStop(1, "rgb(8,10,38)");

  context.fillStyle = gradient;
  context.beginPath();
  context.fillRect(15, 10, frameWidth - 30, 180);
  context.closePath();
  context.stroke();

  context.lineWidth = 20;
  context.strokeStyle = gradient;
  drawRoundedRect(0, 0, frameWidth, 200, 20);
  context.stroke();

  context.lineWidth = 20;
  context.strokeStyle = "rgb(0,0,0,0.5)";
  drawRoundedRect(0, 0, frameWidth, 220, 20);
  context.stroke();

  context.lineWidth = 2;
  context.strokeStyle = "rgb(0,38,56)";
  drawRoundedRect(0, 0, frameWidth, 200, 20);
  context.stroke();

  context.lineWidth = 2;
  context.strokeStyle = "rgb(31,93,119)";
  drawRoundedRect(20, 20, frameWidth - 40, 200, 10);
  context.stroke();
}

function drawLogo() {
  context.font = "70px Ultra";
  context.textAlign = "center";
  context.textBaseline = "top";

  context.lineJoin = 'round';
  context.lineWidth = 10;
  context.strokeStyle = "rgb(0,38,56)";
  context.strokeText("JACKPOT", frameWidth / 2, 30);

  const gradient = context.createLinearGradient(0, 30, 0, 90)
  gradient.addColorStop(0, "rgb(255,75,75)");
  gradient.addColorStop(0.499, "rgb(255,75,75)");
  gradient.addColorStop(0.5, "rgb(217,39,39)");
  gradient.addColorStop(1, "rgb(217,39,39)");
  context.fillStyle = gradient;
  context.fillText("JACKPOT", frameWidth / 2, 30);
}

function drawTop() {
  const gradient = context.createLinearGradient(0, 100, 0, 150)
  gradient.addColorStop(0, "#FEDA75");
  gradient.addColorStop(1, "#FECE43");

  context.fillStyle = gradient;
  context.beginPath();
  context.fillRect(20, 120, frameWidth - 40, 130);
  context.closePath();
  context.stroke();

  context.lineWidth = 20;
  context.strokeStyle = gradient;
  drawRoundedRect(0, 100, frameWidth, 150, 10);
  context.stroke();

  context.lineWidth = 5;
  context.strokeStyle = "#BF9A33";
  drawRoundedRect(0, 100, frameWidth, 150, 10);
  context.stroke();
}

function drawWins() {
  const gradient = context.createLinearGradient(0, 90, 0, 90 + 80)
  gradient.addColorStop(0, "rgb(33,31,47)");
  gradient.addColorStop(1, "rgb(45,54,54)");

  context.lineWidth = 10;
  context.strokeStyle = gradient;
  drawRoundedRect(40, 110, frameWidth - 180, 80, 5);
  context.stroke();

  context.fillStyle = gradient;
  context.beginPath();
  context.fillRect(50, 120, frameWidth - 200, 60);
  context.closePath();
  context.stroke();

  const image = document.getElementById("wins");
  context.drawImage(image, 0, 0, 762, 144, 50, 115, frameWidth - 200, 70);
}

function drawCoinSlot() {
  const gradient = context.createLinearGradient(0, 95, 0, 185);
  gradient.addColorStop(0, "rgb(240, 240, 240)");
  gradient.addColorStop(1, "rgb(130, 130, 130)");

  const x = 615;
  const y = 150;
  const radius = 40;

  context.fillStyle = gradient;
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI);
  context.closePath();
  context.fill();

  context.lineWidth = 5;
  context.strokeStyle = "rgba(0,0,0,0.2)";
  context.beginPath();
  context.arc(x, y, radius - (context.lineWidth / 2), 0, 2 * Math.PI);
  context.closePath();
  context.stroke();

  context.lineWidth = 5;
  context.strokeStyle = "rgb(0,0,0)";
  drawRoundedRect(610, 120, 10, 60, 5);
  context.stroke();
}

function drawDrums() {
  const gradient = context.createLinearGradient(0, drumsVerticalMargin + topMargin, 0, 60 + topMargin + frameHeight - drumsVerticalMargin * 2);
  gradient.addColorStop(0, "rgba(0, 0, 0, 0.5)");
  gradient.addColorStop(0.2, "rgba(0, 0, 0, 0.2)");
  gradient.addColorStop(0.25, "rgba(0, 0, 0, 0.1)");
  gradient.addColorStop(0.5, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(0.8, "rgba(0, 0, 0, 0.1)");
  gradient.addColorStop(0.9, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.1)");

  drums.forEach((drum, index) => {
    context.fillStyle = `rgb(245, 255, 251)`;
    context.fillRect(drumsWidth / 3 * index + drumsHorizontalMargin, drumsVerticalMargin + topMargin, drumsWidth / 3, frameHeight - drumsVerticalMargin * 2);

    context.fillStyle = gradient;
    context.fillRect(drumsWidth / 3 * index + drumsHorizontalMargin, drumsVerticalMargin + topMargin, drumsWidth / 3, frameHeight - drumsVerticalMargin * 2);
  });
}

function drawDrumSymbols() {

}

function drawFrame() {
  const gradient = context.createLinearGradient(0, 50 + topMargin, 0, 60 + topMargin + frameHeight - 100);
  gradient.addColorStop(0, "#FECE43");
  gradient.addColorStop(0.8, "#FEBD14");
  gradient.addColorStop(1, "#BF9A33");

  context.lineWidth = 20;
  context.strokeStyle = "#BF9A33";
  drums.forEach((drum, index) => {
    context.beginPath();
    context.rect(drumsWidth / 3 * index + drumsHorizontalMargin, drumsVerticalMargin + topMargin, drumsWidth / 3, frameHeight - drumsVerticalMargin * 2);
    context.closePath();
    context.stroke();
  });

  context.lineWidth = 20;
  context.strokeStyle = gradient
  drawRoundedRect(0, topMargin, frameWidth, frameHeight, 30);
  context.stroke();
  context.fillStyle = gradient;
  context.fillRect(drumsHorizontalMargin / 2 - 50, topMargin + 10, drumsHorizontalMargin / 2 + 40, frameHeight - 20);
  context.fillRect(frameWidth - drumsHorizontalMargin + 10, topMargin + 10, drumsHorizontalMargin / 2 + 40, frameHeight - 20);

  context.lineWidth = 10;
  context.strokeStyle = "#FECE43";
  drawRoundedRect(
    drumsHorizontalMargin - context.lineWidth,
    drumsVerticalMargin + topMargin - context.lineWidth,
    drumsWidth + context.lineWidth * 2,
    drumsHeight + context.lineWidth * 2,
    10
  );
  context.stroke();

  context.lineWidth = 5;
  context.strokeStyle = "#BF9A33";
  drawRoundedRect(0, topMargin, frameWidth, frameHeight, 30);
  context.stroke();
}

function drawBottom() {
  const gradient = context.createLinearGradient(0, topMargin + frameHeight - 40, 0, canvas.height);
  gradient.addColorStop(0, "#BF9A33");
  gradient.addColorStop(0.1, "#A57B0A");
  gradient.addColorStop(1, "#FEBD14");

  context.fillStyle = gradient;
  context.beginPath();
  context.fillRect(20, topMargin + frameHeight - 20, frameWidth - 40, bottomMargin);
  context.closePath();
  context.stroke();

  context.lineWidth = 20;
  context.strokeStyle = gradient;
  drawRoundedRect(0, topMargin + frameHeight - 40, frameWidth, bottomMargin + 40, 10);
  context.stroke();

  context.lineWidth = 5;
  context.strokeStyle = "#A57B0A";
  drawRoundedRect(0, topMargin + frameHeight - 40, frameWidth, bottomMargin + 40, 10);
  context.stroke();
}

function drawPrizeSlot() {
  context.fillStyle = "rgb(0,0,0)";
  context.beginPath();
  context.fillRect(245, topMargin + frameHeight + 20, frameWidth - 490, bottomMargin - 40);
  context.closePath();
  context.stroke();

  context.lineWidth = 5;
  context.strokeStyle = "#A57B0A";
  drawRoundedRect(240, topMargin + frameHeight + 20, frameWidth - 480, bottomMargin - 40, 5);
  context.stroke();
}

function drawScore() {
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  drawSignBase();
  drawLogo();

  drawTop();
  drawWins();
  drawCoinSlot();

  drawBottom();
  drawPrizeSlot();

  drawDrums();
  drawFrame();

  //drawScore();

  requestAnimationFrame(draw);
}

setInterval(() => update(), updateIntervalMs);
requestAnimationFrame(draw);

/* TODO:
* Spinning drums
* Gambling logic
* Inserting coins
* Show ready
* Pulling lever
* Receiving coins
* Pile of coins
* Lights
* Sounds
*/
