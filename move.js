let currentLane = 1; 
let laneWidth;
let playerX;
let targetX;
let playerSize = 0;

/**
 * Initializes player position
 */
function initPlayer() {
  playerX = width / 2;
  targetX = width / 2;
}

/**
 * Calculates lane widths based on canvas width
 */
function calculateLanes() {
  laneWidth = width / 3;
}

/**
 * Draws the lane dividers
 */
function drawLanes() {
  stroke(100);
  strokeWeight(2);
  for (let i = 1; i < 3; i++) {
    line(i * laneWidth, 0, i * laneWidth, height);
  }
}

/**
 * Updates player position based on current lane
 */
function updatePlayer() {
  targetX = (laneWidth * currentLane) + laneWidth / 2;
  playerX = lerp(playerX, targetX, 0.15);
  playerSize = laneWidth * 0.4;
}

/**
 * Draws the player on screen
 */
function drawPlayer() {
  fill(0, 200, 255);
  noStroke();
  ellipse(playerX, height * 0.8, playerSize, playerSize);
}

/**
 * Handles keyboard input for player movement
 */
function keyPressed() {
  if (gameOver) {
    handleGameOverKeys();
  } else {
    if (keyCode === LEFT_ARROW) {
      if (currentLane > 0) {
        currentLane--;
      }
    } else if (keyCode === RIGHT_ARROW) {
      if (currentLane < 2) {
        currentLane++;
      }
    }
  }
}
