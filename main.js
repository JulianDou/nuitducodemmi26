/**
 * Main game file - contains the game loop
 */

function setup() {
  createCanvas(windowWidth, windowHeight);
  calculateLanes();
  
  initPlayer();
  
  startTimer();
}

function draw() {
  background(40); 

  updateTimer();

 
  updateDifficulty();
  displayLives();

  drawLanes();
  
  updatePlayer();
  drawPlayer();
  
  manageEnemies();
  checkCollision();
  displayTimer();
  
  
  displayGameOver();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateLanes();
}
