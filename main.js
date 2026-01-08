function setup() {
  createCanvas(windowWidth, windowHeight);
  calculateLayout(); 
  initPlayer();
  if (typeof startTimer === 'function') startTimer();
}

function draw() {
  background(40); 

  // Gestion de la pause "Hole in the Wall"
  handlePauseLogic();

  if (!isPaused) {
    // Le jeu ne tourne que si on n'est pas en pause
    if (typeof updateTimer === 'function') updateTimer();
    if (typeof updateDifficulty === 'function') updateDifficulty();
    
    // Update background objects
    if (typeof updateBackgroundObjects === 'function') updateBackgroundObjects();
    
    // Layer 1: Objects behind the horizon
    if (typeof drawBackgroundBehind === 'function') drawBackgroundBehind();
    
    // Layer 2: Ground (covers objects below horizon)
    if (typeof drawGround === 'function') drawGround();
    
    // Layer 3: Objects in front of the horizon
    if (typeof drawBackgroundFront === 'function') drawBackgroundFront();

    drawLanes();
    updatePlayer();
    drawPlayer();
    
    if (typeof manageEnemies === 'function') manageEnemies();
    if (typeof checkCollision === 'function') checkCollision();
  } else {
    // Visuel statique pendant la pause pour qu'on voie encore le circuit
    drawLanes();
    drawPlayer();
  }

  // Interface utilisateur (UI)
  if (typeof displayTimer === 'function') displayTimer();
  if (typeof displayLives === 'function') displayLives();
  if (typeof displayGameOver === 'function') displayGameOver();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateLayout();
}
