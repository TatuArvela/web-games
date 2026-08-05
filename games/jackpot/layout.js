// Canvas dimensions and all derived machine geometry. Loaded before jackpot.js
// and the graphics files so the input/physics logic and the renderer share one
// source of truth for where everything sits — no cross-file load-order coupling.
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const topMargin = 200;
const bottomMargin = 120;
const rightMargin = 120;

const frameWidth = CANVAS_WIDTH - rightMargin;
const frameHeight = CANVAS_HEIGHT - topMargin - bottomMargin;

const drumsHorizontalMargin = 140;
const drumsVerticalMargin = 25;
const drumsWidth = frameWidth - drumsHorizontalMargin * 2;
const drumsHeight = frameHeight - drumsVerticalMargin * 2;

// Right-pillar controls, stacked: coin counter (top), coin slot (middle),
// eject button (bottom). All share the same horizontal center.
const controlsX = drumsHorizontalMargin + drumsWidth + 73; // centered on the silver right pillar (visible span ~550–676)
const coinCounterX = controlsX;
const coinCounterY = topMargin + drumsVerticalMargin + 25;
const coinCounterW = 98;
const coinCounterH = 44;
const coinSlotX = controlsX;
const coinSlotY = topMargin + drumsVerticalMargin + 90; // moved down for the counter
const ejectButtonX = controlsX;
const ejectButtonY = topMargin + drumsVerticalMargin + 155;
const ejectButtonW = 70;
const ejectButtonH = 36;

// Payout tray
const trayW = frameWidth - 184;
const trayX = (frameWidth - trayW) / 2; // centers the payout slot on the middle drum
const trayY = topMargin + frameHeight + bottomMargin - 85;
const trayH = 55;

// Pull-lever geometry. The ball is the grab target; the shaft and base sit
// below it. armPullOffset (0 at rest) slides the shaft + ball downward. The
// renderer and the click hit-test both derive from these so they can't drift.
const leverTopY = CANVAS_HEIGHT / 2 - 200; // arm/ball vertical anchor at rest
const leverBallX = CANVAS_WIDTH - 40;
const leverBallR = 40;
const leverArmX = CANVAS_WIDTH - 110;
const leverBaseX = CANVAS_WIDTH - 120;
const leverBaseY = CANVAS_HEIGHT / 2 - 20;
