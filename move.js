let currentLane = 1; 
let laneWidth;
let playerX;
let targetX;
let playerSize = 0;

// Variables pour "Hole in the Wall"
let isPaused = false;
let lastPauseTime = 0;
let pauseDuration = 5000; 
let poseImages = [];
let currentPoseImage;
let poseValidated = false;
let validationTime = 0;
let currentTargetPose = 'T'; // Store the target pose name directly

function preload() {
  // Chargement des images de poses (préchargées pour éviter loadImage au runtime)
 
  
  // Précharge le modèle bodyPose pour la webcam
  if (typeof preloadBodyPose === 'function') preloadBodyPose();
}

function initPlayer() {
  playerX = width / 2;
  targetX = width / 2;
  lastPauseTime = millis();
  
  // Initialise la capture webcam avec bodyPose
  if (typeof initBodyPoseCamera === 'function') initBodyPoseCamera();
}

/**
 * Définit la géométrie des lignes
 */
function calculateLayout() {
  let trackWidth = width * 0.4;
  laneWidth = trackWidth / 3;
}

function getLaneXAtY(lane, y) {
  let trackTop = height / 3;
  let trackBottom = height;
  let trackHeight = trackBottom - trackTop;
  let trackWidth = width * 0.4;
  let bottomLaneWidth = trackWidth / 3;
  let bottomOffset = (width - trackWidth) / 2;
  let topTrackWidth = trackWidth * 0.2;
  let topLaneWidth = topTrackWidth / 3;
  let topOffset = (width - topTrackWidth) / 2;
  
  let bottomX = bottomOffset + (lane * bottomLaneWidth) + bottomLaneWidth / 2;
  let topX = topOffset + (lane * topLaneWidth) + topLaneWidth / 2;
  
  let t = constrain((y - trackTop) / trackHeight, 0, 1);
  return lerp(topX, bottomX, t);
}

function getScaleAtY(y) {
  let t = constrain((y - (height/3)) / (height - (height/3)), 0, 1);
  return lerp(0.3, 1.0, t);
}

function drawLanes() {
  stroke(100);
  strokeWeight(2);
  let trackTop = height / 3;
  let trackWidth = width * 0.4;
  let bottomLaneWidth = trackWidth / 3;
  let bottomOffset = (width - trackWidth) / 2;
  
  // Variables de perspective qui manquaient :
  let topTrackWidth = trackWidth * 0.2;
  let topLaneWidth = topTrackWidth / 3; 
  let topOffset = (width - topTrackWidth) / 2;
  
  for (let i = 1; i < 3; i++) {
    let bottomX = bottomOffset + (i * bottomLaneWidth);
    let topX = topOffset + (i * topLaneWidth);
    line(topX, trackTop, bottomX, height);
  }
  line(topOffset, trackTop, bottomOffset, height);
  line(topOffset + topTrackWidth, trackTop, bottomOffset + trackWidth, height);
}

function updatePlayer() {
  if (!isPaused) {
    let playerY = height * 0.8;
    targetX = getLaneXAtY(currentLane, playerY);
    playerX = lerp(playerX, targetX, 0.15);
    let baseSize = laneWidth * 0.4;
    playerSize = baseSize * getScaleAtY(playerY);
  }
}

function drawPlayer() {
  fill(0, 200, 255);
  noStroke();
  ellipse(playerX, height * 0.8, playerSize, playerSize);
}

function handlePauseLogic() {
  if (!isPaused && millis() - lastPauseTime > 3000) {
    triggerPoseEvent();
  }

  if (isPaused) {
    // Affiche la webcam en plein écran
    if (typeof drawBodyPose === 'function') {
      drawBodyPose();
    }
    
    fill(255);
    textAlign(CENTER);
    textSize(32);
    noStroke();
    
    // Show result message if validation has occurred
    if (poseValidated && window.lastPoseResult) {
      fill(window.lastPoseResult.success ? color(0, 255, 0) : color(255, 0, 0));
      textSize(48);
      text(window.lastPoseResult.success ? "BRAVO !" : "RATÉ !", width/2, height/2 - 50);
      textSize(28);
      fill(255);
      text(window.lastPoseResult.message, width/2, height/2 + 20);
      
      // End pause after showing result for 2 seconds
      if (millis() - validationTime > 2000) {
        isPaused = false;
        poseValidated = false;
        lastPauseTime = millis();
      }
    } else {
      // Normal countdown display
      text("HOLE IN THE WALL !", width/2, height/2 - 50);
      
      // Draw the target pose zones
      if (typeof drawPoseZones === 'function') {
        drawPoseZones(currentTargetPose);
      }
      
      // Display the target pose name
      fill(255, 255, 0);
      textSize(48);
      text("Pose " + currentTargetPose, width/2, 80);
      
      if (currentPoseImage) {
          image(currentPoseImage, width - 220, 20, 200, 200);
      }

      let timeLeft = ceil((pauseDuration - (millis() - lastPauseTime)) / 1000);
      noStroke();
      text("REPRODUIS LA POSE : " + (timeLeft > 0 ? timeLeft : 0) + "s", width/2, height/2 + 50);

      // Validate the pose when time is up
      if (millis() - lastPauseTime > pauseDuration) {
          if (typeof handlePoseValidation === 'function') {
            handlePoseValidation();
          }
          poseValidated = true;
          validationTime = millis();
      }
    }
  }
}

 function triggerPoseEvent() {
  isPaused = true;
  lastPauseTime = millis();
  // Pick a random pose
  const poses = ['T', 'Y', 'L'];
  currentTargetPose = random(poses);
  // Utilise une image déjà préchargée (optional)
  currentPoseImage = random(poseImages);
}

function keyPressed() {
  if (typeof gameOver !== 'undefined' && gameOver) {
    handleGameOverKeys();
  } else if (!isPaused) {
    if (keyCode === LEFT_ARROW && currentLane > 0) currentLane--;
    if (keyCode === RIGHT_ARROW && currentLane < 2) currentLane++;
  }
}
