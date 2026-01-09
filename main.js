function setup() {
  createCanvas(windowWidth, windowHeight);
  calculateLayout(); 
  initPlayer();
  
  // Preload all theme assets
  if (typeof preloadAssets === 'function') preloadAssets();
  
  if (typeof startTimer === 'function') startTimer();
}

function draw() {
  background(40);

  // Si gameOver, on affiche seulement l'écran de game over et on arrête tout le reste
  if (typeof gameOver !== 'undefined' && gameOver) {
    if (typeof displayGameOver === 'function') displayGameOver();
    return; // On arrête ici, rien d'autre ne tourne
  }

  if (!isPaused) {
    // Le jeu ne tourne que si on n'est pas en pause
    if (typeof updateTimer === 'function') updateTimer();
    if (typeof updateDifficulty === 'function') updateDifficulty();
    
    // Update background objects
    if (typeof updateBackgroundObjects === 'function') updateBackgroundObjects();
    
    // Z-INDEX LAYERING (bottom to top):
    // Layer 0: Ground/terrain (bottom layer)
    if (typeof drawGround === 'function') drawGround();
    
    // Layer 1: Sky background (on top of ground, at horizon)
    if (typeof drawSky === 'function') drawSky();
    
    // Layer 2: Track lanes
    drawLanes();
    
    // Layer 3: Background objects behind horizon
    if (typeof drawBackgroundBehind === 'function') drawBackgroundBehind();
    
    // Layer 4: Background objects in front of horizon
    if (typeof drawBackgroundFront === 'function') drawBackgroundFront();
    
    // Layer 5: Player
    updatePlayer();
    drawPlayer();
    
    // Layer 6: Enemies (obstacles on track)
    if (typeof manageEnemies === 'function') manageEnemies();
    if (typeof checkCollision === 'function') checkCollision();
  } else {
    // Visuel statique pendant la pause pour qu'on voie encore le circuit
    // Keep same layering during pause
    if (typeof drawGround === 'function') drawGround();
    if (typeof drawSky === 'function') drawSky();
    
    drawLanes();
    drawPlayer();
  }

  // Layer 7: Pose prompt (above game, below UI)
  // Gestion de la pause "Hole in the Wall"
  handlePauseLogic();

  // Layer 8: Interface utilisateur (UI) - topmost layer
  if (typeof displayTimer === 'function') displayTimer();
  if (typeof displayLives === 'function') displayLives();
  if (typeof displayGameOver === 'function') displayGameOver();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateLayout();
}
