let enemies = [];
let lastSpawnTime = 0;
let spawnInterval = 2000; // spawn every 2 seconds (in milliseconds)

// Base speed for enemies; updated by difficulty logic
let enemyBaseSpeed = 3;
// Last time (in seconds) we increased difficulty
let lastDifficultyIncrease = 0;

// Valeur de base initiale pour calculer la couleur en fonction de la difficulté
let enemyStartBase = 3;

/**
 * Retourne une couleur (r,g,b) en fonction de la vitesse
 */
/**
 * Retourne une couleur (r,g,b) en fonction de la vitesse de base actuelle
 * La couleur évolue progressivement quand `enemyBaseSpeed` augmente.
 */
function getColorForBase(baseSpeed) {
  // On mappe la progression depuis la base initiale vers une augmentation max (ex: +10)
  let maxIncrease = 10;
  let t = (baseSpeed - enemyStartBase) / maxIncrease;
  t = constrain(t, 0, 1);
  // blue -> red transition
  let r = lerp(0, 255, t);
  let g = 0;
  let b = lerp(255, 0, t);
  return [r, g, b];
}

/**
 * Spawns a single enemy on a random lane
 */
function spawnEnemy() {
  let randomLane = floor(random(0, 3)); // 0, 1, or 2
  let enemyX = (laneWidth * randomLane) + laneWidth / 2;
  
  let enemy = {
    x: enemyX,
    y: -30, // start above the screen
    lane: randomLane,
    size: 40,
    // Use the global base speed and add a small random variation
    speed: enemyBaseSpeed + random(0, 1)
  };
  // set initial color based on current base speed (représente la difficulté)
  enemy.color = getColorForBase(enemyBaseSpeed);
  
  enemies.push(enemy);
}

/**
 * Gère la vitesse qui augmente tous les 10sec 
 */
function updateDifficulty() {
  if (gameOver) return;

  // Si on a dépassé le palier de 10s depuis la dernière augmentation
  if (elapsedTime >= lastDifficultyIncrease + 5) {
    let delta = 1; // augmentation de la base
    enemyBaseSpeed += delta;
    lastDifficultyIncrease = elapsedTime;

    // applique l'augmentation aux ennemis existants et met à jour leur couleur
        for (let i = 0; i < enemies.length; i++) {
      enemies[i].speed += delta;
      enemies[i].color = getColorForBase(enemyBaseSpeed);
    }
  }
}

/**
 * Manages all enemies: moves them down, removes off-screen enemies,
 * and spawns new enemies at random intervals
 */
function manageEnemies() {
  // Move enemies down and draw them
  for (let i = enemies.length - 1; i >= 0; i--) {
    let enemy = enemies[i];

    
    
    // Move enemy down
    enemy.y += enemy.speed;
    
    // Draw enemy using its color
    let c = enemy.color || getColorForBase(enemyBaseSpeed);
    fill(c[0], c[1], c[2]);
    noStroke();
    ellipse(enemy.x, enemy.y, enemy.size, enemy.size);
    
    // Remove enemy if it's off screen (past the bottom)
    if (enemy.y > height + enemy.size) {
      enemies.splice(i, 1);
    }
  }
  
  // Spawn new enemies at random intervals
  if (millis() - lastSpawnTime > spawnInterval) {
    spawnEnemy();
    lastSpawnTime = millis();
    // Add some randomness to the spawn interval (between 1.5 and 3 seconds)
    spawnInterval = random(1500, 3000);
  }
}
