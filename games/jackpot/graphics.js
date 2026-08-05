// Frame compositor: clears the canvas and paints every layer back-to-front
// each animation frame. Draw helpers live in cabinet.js and devices.js.

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  drawSignBase();
  drawSignLights();
  drawLogo();

  drawTop();
  drawWins();

  drawBottom();

  drawArmBase();
  drawArm();
  drawArmBall();

  drawFrameBack();
  drawDrums();
  drawFrameFront();

  drawCoinTray();
  drawCoins();
  drawCoinCounter();
  drawEjectButton();
  drawCoinSlot();
  drawInsertingCoins();

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
