let gameOver = false;
let startTime = 0;
let elapsedTime = 0;
let gameOverTime = 0;
// Nombre de vies du joueur (coeurs)
let playerLives = 3;

/**
 * Initialise le chronomètre au démarrage du jeu
 */
function startTimer() {
  startTime = millis();
  gameOver = false;
}

/**
 * Met à jour le temps écoulé en secondes
 */
function updateTimer() {
  if (!gameOver) {
    elapsedTime = Math.floor((millis() - startTime) / 1000);
  }
}

/**
 * Affiche le chronomètre en haut de l'écran
 */
function displayTimer() {
  fill(255);
  textSize(22);
  textAlign(LEFT);
  text("Temps: " + elapsedTime + "s", 20, 50);
}

/**
 * Vérifie la collision entre le joueur et les ennemis
 */
function checkCollision() {
  if (gameOver) return;
  const playerRadius = playerSize / 2;
  const playerPosY = height * 0.8;

  // itérer à l'envers pour pouvoir supprimer des ennemis en collision
  for (let i = enemies.length - 1; i >= 0; i--) {
    let enemy = enemies[i];
    const enemyRadius = enemy.size / 2;

    // Distance entre le joueur et l'ennemi
    let distance = dist(playerX, playerPosY, enemy.x, enemy.y);

    // Collision si la distance est inférieure à la somme des rayons
    if (distance < playerRadius + enemyRadius) {
      // retirer l'ennemi et décrémenter les vies
      enemies.splice(i, 1);
      playerLives = max(0, playerLives - 1);
      if (playerLives <= 0) {
        triggerGameOver();
      }
    }
  }
}

/**
 * systeme de 3 vie avec les coeurs
 */
function displayLives() {
  const heartSize = 30;
  for (let i = 0; i < playerLives; i++) {
    
    fill(255, 0, 0);
    noStroke(); 
    // Dessiner un coeur simple (2 ellipses + triangle) pour éviter les erreurs de béziers
    // placer les coeurs à droite avec un petit marge
    let hx = width - 20 - i * (heartSize + 10);
    let hy = 20;
    push();
    translate(hx, hy);
    // deux demi-cercles supérieurs
    ellipse(-heartSize * 0.25, -heartSize * 0.15, heartSize * 0.5, heartSize * 0.5);
    ellipse(heartSize * 0.25, -heartSize * 0.15, heartSize * 0.5, heartSize * 0.5);
    // triangle inférieur
    triangle(-heartSize * 0.5, -heartSize * 0.15, heartSize * 0.5, -heartSize * 0.15, 0, heartSize * 0.6);
    pop();
  }
}


/**
 * Déclenche l'écran de game over
 */
function triggerGameOver() {
  gameOver = true;
  gameOverTime = elapsedTime;
}

/**
 * Affiche l'écran de game over
 */
function displayGameOver() {
  if (!gameOver) return;
  
  // Fond semi-transparent
  fill(0, 0, 0, 200);
  rect(0, 0, width, height);
  
  // Texte "GAME OVER"
  fill(255, 0, 0);
  textSize(64);
  textAlign(CENTER, CENTER);
  text("GAME OVER", width / 2, height / 2 - 100);
  
  // Score final
  fill(255, 255, 0);
  textSize(32);
  text("Temps survécu: " + gameOverTime + " secondes", width / 2, height / 2 + 50);
  
  // Instructions pour redémarrer
  fill(255);
  textSize(20);
  text("Appuyez sur espace pour recommencer", width / 2, height / 2 + 150);
}

/**
 * Redémarre le jeu
 */
function restartGame() {
  if (gameOver) {
    enemies = [];
    startTimer();
    lastSpawnTime = 0;
    // Reset difficulty
    if (typeof enemyBaseSpeed !== 'undefined') enemyBaseSpeed = 3;
    if (typeof lastDifficultyIncrease !== 'undefined') lastDifficultyIncrease = 0;
    // Reset lives
    playerLives = 3;
    // Reset background
    resetBackground();
  }
}

/**
 * Gère la touche espace pour redémarrer
 */
function handleGameOverKeys() {
    if (gameOver && (key === ' ')) { // espace
        restartGame();
    }
}
