let backgroundObjects = [];
let lastBgSpawnTime = -2000; // Start negative so first spawn happens quickly
let bgSpawnInterval = 1500; // spawn interval in milliseconds

/**
 * Spawns a background object anywhere on screen except on the track
 */
function spawnBackgroundObject() {
  // Track dimensions at horizon (top)
  let trackTop = height / 3;
  let trackWidth = width * 0.4;
  let topTrackWidth = trackWidth * 0.2;
  
  // Spawn AT the horizon (will rise from behind ground)
  let startY = trackTop;
  
  // Calculate track boundaries at horizon for perspective
  let trackLeft = (width - topTrackWidth) / 2;
  let trackRight = trackLeft + topTrackWidth;
  
  // Random X position at horizon: either left or right of track
  // Keep objects further from center to ensure they expand away from track
  let startXAtHorizon;
  let side; // -1 for left, 1 for right
  let minDistanceFromCenter = topTrackWidth * 0.8; // Minimum distance from center
  
  if (random() > 0.5) {
    // Left side of screen
    let leftBound = width / 2 - minDistanceFromCenter;
    startXAtHorizon = random(0, leftBound);
    side = -1;
  } else {
    // Right side of screen
    let rightBound = width / 2 + minDistanceFromCenter;
    startXAtHorizon = random(rightBound, width);
    side = 1;
  }
  
  let bgObject = {
    y: startY,
    horizonX: startXAtHorizon, // X position at horizon
    side: side,
    baseSize: 60,
    size: 60,
    speed: 2,
    color: [255, 165, 0] // orange placeholder
  };
  
  backgroundObjects.push(bgObject);
}

/**
 * Updates all background objects positions and spawning
 */
function updateBackgroundObjects() {
  // Update positions
  for (let i = backgroundObjects.length - 1; i >= 0; i--) {
    let obj = backgroundObjects[i];
    
    // Move object down
    obj.y += obj.speed;
    
    // Track dimensions for perspective calculation
    let trackTop = height / 3;
    let trackBottom = height;
    let trackHeight = trackBottom - trackTop;
    
    // Calculate position in perspective (0 at horizon, 1 at bottom)
    let t = constrain((obj.y - trackTop) / trackHeight, 0, 1);
    
    // Calculate scale based on Y position
    obj.size = obj.baseSize * lerp(0.2, 1.5, t);
    
    // Calculate X position with perspective
    // Objects move outward more aggressively as they get closer (following track perspective)
    let horizonDistance = abs(obj.horizonX - width / 2);
    let bottomDistance = horizonDistance * lerp(1.0, 4.0, t); // Expand outward significantly
    obj.x = width / 2 + (obj.side * bottomDistance);
    
    // Remove if off screen
    if (obj.y > height + obj.size) {
      backgroundObjects.splice(i, 1);
    }
  }
  
  // Spawn new background objects at intervals
  if (millis() - lastBgSpawnTime > bgSpawnInterval) {
    spawnBackgroundObject();
    lastBgSpawnTime = millis();
    // Add randomness to spawn interval
    bgSpawnInterval = random(800, 2000);
  }
}

/**
 * Draws background objects that are below the horizon (behind ground)
 */
function drawBackgroundBehind() {
  let trackTop = height / 3;
  for (let obj of backgroundObjects) {
    if (obj.y < trackTop) {
      fill(obj.color[0], obj.color[1], obj.color[2]);
      noStroke();
      ellipse(obj.x, obj.y, obj.size, obj.size);
    }
  }
}

/**
 * Draws background objects that are above the horizon (in front of ground)
 */
function drawBackgroundFront() {
  let trackTop = height / 3;
  for (let obj of backgroundObjects) {
    if (obj.y >= trackTop) {
      fill(obj.color[0], obj.color[1], obj.color[2]);
      noStroke();
      ellipse(obj.x, obj.y, obj.size, obj.size);
    }
  }
}

/**
 * Draws the ground (bottom 2/3 of screen)
 */
function drawGround() {
  let trackTop = height / 3;
  fill(50, 180, 50); // Green color
  noStroke();
  rect(0, trackTop, width, height - trackTop);
}

/**
 * Resets background objects (for game restart)
 */
function resetBackground() {
  backgroundObjects = [];
  lastBgSpawnTime = millis() - 2000; // Allow immediate spawn after reset
}
