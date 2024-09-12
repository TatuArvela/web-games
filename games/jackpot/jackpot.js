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
  context.fillRect(20, 10, frameWidth - 40, 180);
  context.closePath();
  context.stroke();

  context.lineWidth = 20;
  context.strokeStyle = gradient;
  drawRoundedRect(10, 0, frameWidth - 20, 200, 20);
  context.stroke();

  context.lineWidth = 20;
  context.strokeStyle = "rgb(0,0,0,0.5)";
  drawRoundedRect(10, 0, frameWidth - 20, 220, 20);
  context.stroke();

  context.lineWidth = 2;
  context.strokeStyle = "rgb(0,38,56)";
  drawRoundedRect(10, 0, frameWidth - 20, 200, 20);
  context.stroke();

  context.lineWidth = 2;
  context.strokeStyle = "rgb(31,93,119)";
  drawRoundedRect(30, 20, frameWidth - 60, 200, 10);
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
  gradient.addColorStop(0, "rgb(238,238,238)");
  gradient.addColorStop(0.499, "rgb(238,238,238)");
  gradient.addColorStop(0.5, "rgb(204,204,204)");
  gradient.addColorStop(1, "rgb(204,204,204)");
  context.fillStyle = gradient;
  context.fillText("JACKPOT", frameWidth / 2, 30);
}

function drawTop() {
  const gradient = context.createLinearGradient(0, 100, 0, 150)
  gradient.addColorStop(0, "rgb(255,227,152)");
  gradient.addColorStop(1, "rgb(255,214,94)");

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

function drawWinsText() {
  context.font = "32px Ultra";
  context.textAlign = "center";
  context.textBaseline = "top";

  context.lineJoin = 'round';
  context.lineWidth = 10;
  context.strokeStyle = "rgb(27,29,30)";
  context.strokeText("WINS", 290, 113);

  const gradient = context.createLinearGradient(0, 113, 0, 143)
  gradient.addColorStop(0, "rgb(236,189,93)");
  gradient.addColorStop(0.499, "rgb(236,189,93)");
  gradient.addColorStop(0.5, "rgb(210,116,58)");
  gradient.addColorStop(1, "rgb(210,116,58)");
  context.fillStyle = gradient;
  context.fillText("WINS", 290, 113);
}

function drawWins() {
  const darkGradient = context.createLinearGradient(0, 90, 0, 90 + 80)
  darkGradient.addColorStop(0, "rgb(33,31,47)");
  darkGradient.addColorStop(1, "rgb(45,54,54)");

  context.lineWidth = 10;
  context.strokeStyle = darkGradient;
  drawRoundedRect(40, 110, frameWidth - 180, 80, 5);
  context.stroke();

  context.fillStyle = darkGradient;
  context.beginPath();
  context.fillRect(50, 120, frameWidth - 200, 60);
  context.closePath();
  context.stroke();

  context.fillStyle = darkGradient;
  context.beginPath();
  context.fillRect(54, 115, frameWidth - 206, 70);
  context.closePath();
  context.stroke();

  context.lineWidth = 2;
  context.strokeStyle = "rgb(117,117,117)";
  drawRoundedRect(54, 115, frameWidth - 206, 70, 10);
  context.stroke();

  const lightGradient = context.createLinearGradient(0, 95, 0, 185);
  lightGradient.addColorStop(0, "rgb(130, 130, 130)");
  lightGradient.addColorStop(1, "rgb(240, 240, 240)");

  context.fillStyle = lightGradient;
  drawRoundedRect(60, 117, frameWidth - 218, 66, 8);
  context.fill();

  context.beginPath();
  context.moveTo(61, 140);
  context.lineTo(521, 140);
  context.stroke();

  context.beginPath();
  context.moveTo(61, 162);
  context.lineTo(521, 162);
  context.stroke();

  context.fillStyle = "rgb(73,73,73)";
  context.beginPath();
  context.fillRect(214, 140, 154, 42);
  context.closePath();
  context.stroke();

  const emphasisGradient = context.createLinearGradient(0, 140, 0, 182);
  emphasisGradient.addColorStop(0, "rgb(130, 130, 130)");
  emphasisGradient.addColorStop(0.5, "rgb(240, 240, 240)");
  emphasisGradient.addColorStop(1, "rgb(130, 130, 130)");

  context.fillStyle = emphasisGradient;
  drawRoundedRect(218, 140, 46, 42, 2);
  context.fill();
  drawRoundedRect(268, 140, 46, 42, 2);
  context.fill();
  drawRoundedRect(318, 140, 46, 42, 2);
  context.fill();
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
  const gradient1 = context.createLinearGradient(0, 50 + topMargin, 0, 60 + topMargin + frameHeight - 100);
  gradient1.addColorStop(0, "rgb(183,145,39)");
  gradient1.addColorStop(0.3, "rgb(254,189,20)");
  gradient1.addColorStop(1, "rgb(194,157,50)");

  context.lineWidth = 20;
  context.strokeStyle = gradient1;
  drums.forEach((drum, index) => {
    context.beginPath();
    context.rect(drumsWidth / 3 * index + drumsHorizontalMargin, drumsVerticalMargin + topMargin, drumsWidth / 3, frameHeight - drumsVerticalMargin * 2);
    context.closePath();
    context.stroke();
  });

  const gradient2 = context.createLinearGradient(0, 50 + topMargin, 0, 60 + topMargin + frameHeight - 100);
  gradient2.addColorStop(0, "rgb(254,206,67)");
  gradient2.addColorStop(0.8, "rgb(254,189,20)");
  gradient2.addColorStop(1, "rgb(183,145,39)");

  context.lineWidth = 20;
  context.strokeStyle = gradient2
  drawRoundedRect(0, topMargin, frameWidth, frameHeight, 30);
  context.stroke();
  context.fillStyle = gradient2;
  context.fillRect(drumsHorizontalMargin / 2 - 50, topMargin + 10, drumsHorizontalMargin / 2 + 40, frameHeight - 20);
  context.fillRect(frameWidth - drumsHorizontalMargin + 10, topMargin + 10, drumsHorizontalMargin / 2 + 40, frameHeight - 20);

  const gradient3 = context.createLinearGradient(0, 50 + topMargin, 0, 60 + topMargin + frameHeight - 100);
  gradient3.addColorStop(0, "rgb(143,113,27)");
  gradient3.addColorStop(0.3, "rgb(254,189,20)");
  gradient3.addColorStop(1, "rgb(117,96,38)");

  context.lineWidth = 10;
  context.strokeStyle = gradient3;
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
  gradient.addColorStop(0, "rgb(131,96,23)");
  gradient.addColorStop(0.7, "rgb(254,189,20)");

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
  context.fillRect(242, topMargin + frameHeight + 22, frameWidth - 484, bottomMargin - 44);
  context.closePath();
  context.stroke();

  context.lineWidth = 3;
  context.strokeStyle = "rgb(165,123,10)";
  drawRoundedRect(240, topMargin + frameHeight + 20, frameWidth - 480, bottomMargin - 40, 5);
  context.stroke();
}

function drawArmBase() {
  context.save();
  context.translate(canvas.width - 120, canvas.height / 2 - 20);

  context.lineWidth = 5;
  context.strokeStyle = "rgb(105,105,105)";
  const gradient = context.createLinearGradient(0, 0, 0, 120);
  gradient.addColorStop(0, "rgb(183,183,183)");
  gradient.addColorStop(0.2, "rgb(211,211,211)");
  gradient.addColorStop(0.8, "rgb(100,100,100)");
  context.fillStyle = gradient;

  const arm = [[0, 0], [40, 20], [40, 100], [0, 120]];
  context.beginPath();
  context.moveTo(arm[0], arm[1]);
  for (let item = 0; item < arm.length; item += 1) {
    context.lineTo(arm[item][0], arm[item][1])
  }
  context.closePath();
  context.stroke();
  context.fill();

  context.restore();
}

function drawArm() {
  context.save();
  context.translate(canvas.width - 110, canvas.height / 2 - 200);

  context.lineWidth = 8;
  context.strokeStyle = "rgb(105,105,105)";
  const gradient = context.createLinearGradient(0, 0, 0, 120);
  gradient.addColorStop(0, "rgb(183,183,183)");
  gradient.addColorStop(0.2, "rgb(211,211,211)");
  gradient.addColorStop(0.8, "rgb(100,100,100)");
  context.fillStyle = gradient;

  const base = [[55, 0], [75, 0], [20, 200], [5, 195]];
  context.beginPath();
  context.moveTo(base[0], base[1]);
  for (let item = 0; item < base.length; item += 1) {
    context.lineTo(base[item][0], base[item][1])
  }
  context.closePath();
  context.stroke();
  context.fill();

  context.restore();
}

function drawArmBall() {
  context.save();
  context.translate(canvas.width - 40, canvas.height / 2 - 200);

  context.beginPath();
  context.arc(0, 0, 40, 0, Math.PI * 2, false);
  context.fillStyle = "rgb(152,0,0)";
  context.fill();

  const reflectionGradient1 = context.createRadialGradient(-20, -20, 10, 0, 0, 50);
  reflectionGradient1.addColorStop(0, "rgba(255,62,62,0.8)");
  reflectionGradient1.addColorStop(1, "rgba(255, 255, 255, 0)");
  context.fillStyle = reflectionGradient1;
  context.beginPath();
  context.arc(0, 0, 40, 0, Math.PI * 2, false);
  context.fill();

  const reflectionGradient2 = context.createRadialGradient(-10, -20, 2, -10, -20, 20);
  reflectionGradient2.addColorStop(0, "rgba(255,255,255,0.9)");
  reflectionGradient2.addColorStop(1, "rgba(255, 255, 255, 0)");
  context.fillStyle = reflectionGradient2;
  context.beginPath();
  context.arc(0, 0, 40, 0, Math.PI * 2, false);
  context.fill();


  context.restore();
}

function drawScore() {
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  drawSignBase();
  drawLogo();

  drawTop();
  drawWins();
  drawWinsText();
  drawCoinSlot();

  drawBottom();
  drawPrizeSlot();

  drawArmBase();
  drawArm();
  drawArmBall();

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
