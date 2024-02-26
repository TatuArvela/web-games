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

const drums = Array.from({ length: 3 }, () => new Drum());

function update() {}

function drawBackground() {
  context.fillStyle = "rgb(0, 0, 0)";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawDrums() {
  drums.forEach((drum, index) => {
    context.fillStyle = `rgb(255, 255, 255)`;
    context.fillRect((canvas.width - 100) / 3 * index + 50, 50, (canvas.width - 100) / 3, canvas.height - 50);
  });
}

function drawForeground() {
  context.fillStyle = "rgb(255, 255, 128)";
  context.fillRect(0, 0, canvas.width, 50);
  context.fillRect(0, canvas.height - 50, canvas.width, 50);
  context.fillRect(0, 0, 50, canvas.height);
  context.fillRect(canvas.width - 50, 0, 50, canvas.height);
}

function drawHud() {}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawDrums();
  drawForeground();
  drawHud();

  requestAnimationFrame(draw);
}

setInterval(() => update(), updateIntervalMs);
requestAnimationFrame(draw);
