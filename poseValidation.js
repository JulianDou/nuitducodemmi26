/**
 * poseValidation.js - Pose Validation Logic
 * Validates if the user is performing the correct pose by checking if keypoints fit in designated zones
 */

// Hit zone tolerance (radius around target points)
const HIT_ZONE_RADIUS = 80;
const MIN_CONFIDENCE = 0.3;

/**
 * Define target zones for each pose (as percentage of screen dimensions)
 * Each zone is { x: fraction of width, y: fraction of height }
 */
const POSE_TEMPLATES = {
  'T': {
    leftWrist: { x: 0.2, y: 0.67 },
    leftElbow: { x: 0.3, y: 0.67 },
    leftShoulder: { x: 0.4, y: 0.67 },
    rightShoulder: { x: 0.6, y: 0.67 },
    rightElbow: { x: 0.7, y: 0.67 },
    rightWrist: { x: 0.8, y: 0.67 }
  },
  'Y': {
    leftWrist: { x: 0.25, y: 0.47 },
    leftElbow: { x: 0.35, y: 0.57 },
    leftShoulder: { x: 0.43, y: 0.67 },
    rightShoulder: { x: 0.57, y: 0.67 },
    rightElbow: { x: 0.65, y: 0.57 },
    rightWrist: { x: 0.75, y: 0.47 }
  },
  'L': {
    leftWrist: { x: 0.2, y: 0.67 },
    leftElbow: { x: 0.3, y: 0.67 },
    leftShoulder: { x: 0.43, y: 0.67 },
    rightShoulder: { x: 0.57, y: 0.67 },
    rightElbow: { x: 0.57, y: 0.42 },
    rightWrist: { x: 0.57, y: 0.17 }
  }
};

/**
 * Draw the target pose zones on screen
 * @param {string} targetPoseName - Name of the target pose
 */
function drawPoseZones(targetPoseName) {
  const template = POSE_TEMPLATES[targetPoseName.toUpperCase()];
  if (!template) {
    console.log("No template found for pose:", targetPoseName);
    return;
  }
  
  console.log("Drawing zones for pose:", targetPoseName);

  push();
  // Draw target zones as circles
  noFill();
  stroke(255, 255, 0, 150);
  strokeWeight(3);
  
  for (let key in template) {
    let zone = template[key];
    let x = zone.x * width;
    let y = zone.y * height;
    circle(x, y, HIT_ZONE_RADIUS * 2);
  }
  
  // Draw connecting lines to show the pose shape
  stroke(255, 255, 0, 100);
  strokeWeight(2);
  
  // Arms and torso outline
  if (template.leftWrist && template.leftShoulder) {
    line(template.leftWrist.x * width, template.leftWrist.y * height,
         template.leftShoulder.x * width, template.leftShoulder.y * height);
  }
  if (template.rightWrist && template.rightShoulder) {
    line(template.rightWrist.x * width, template.rightWrist.y * height,
         template.rightShoulder.x * width, template.rightShoulder.y * height);
  }
  if (template.leftShoulder && template.rightShoulder) {
    line(template.leftShoulder.x * width, template.leftShoulder.y * height,
         template.rightShoulder.x * width, template.rightShoulder.y * height);
  }
  if (template.leftShoulder && template.leftHip) {
    line(template.leftShoulder.x * width, template.leftShoulder.y * height,
         template.leftHip.x * width, template.leftHip.y * height);
  }
  if (template.rightShoulder && template.rightHip) {
    line(template.rightShoulder.x * width, template.rightShoulder.y * height,
         template.rightHip.x * width, template.rightHip.y * height);
  }
  if (template.leftHip && template.rightHip) {
    line(template.leftHip.x * width, template.leftHip.y * height,
         template.rightHip.x * width, template.rightHip.y * height);
  }
  
  pop();
}

/**
 * Main pose validation function - check if keypoints fit in target zones
 * @param {Array} poses - Array of detected poses from bodyPose
 * @param {string} targetPoseName - Name of the target pose ('T', 'Y', or 'L')
 * @returns {Object} { valid: boolean, message: string, matchedPoints: number, totalPoints: number }
 */
function validatePose(poses, targetPoseName) {
  console.log("Validating pose:", targetPoseName, "Poses detected:", poses ? poses.length : 0);
  
  if (!poses || poses.length === 0) {
    return { valid: false, message: "Aucune personne détectée", matchedPoints: 0, totalPoints: 0 };
  }

  const template = POSE_TEMPLATES[targetPoseName.toUpperCase()];
  if (!template) {
    return { valid: false, message: "Pose inconnue", matchedPoints: 0, totalPoints: 0 };
  }

  const pose = poses[0];
  const kp = pose.keypoints;
  
  // Map template keys to keypoint indices
  const keypointMap = {
    'leftWrist': 9,
    'leftElbow': 7,
    'leftShoulder': 5,
    'rightShoulder': 6,
    'rightElbow': 8,
    'rightWrist': 10
  };

  let matchedPoints = 0;
  let totalPoints = 0;
  let missedParts = [];

  // Check each required keypoint against its target zone
  for (let key in template) {
    const keypointIndex = keypointMap[key];
    const keypoint = kp[keypointIndex];
    
    if (keypoint.confidence < MIN_CONFIDENCE) {
      missedParts.push(key);
      totalPoints++;
      continue;
    }

    totalPoints++;
    const targetZone = template[key];
    const targetX = targetZone.x * width;
    const targetY = targetZone.y * height;
    
    // Get video dimensions - video is sized to windowWidth x windowHeight in video.js
    const videoWidth = typeof video !== 'undefined' && video ? video.width : width;
    const videoHeight = typeof video !== 'undefined' && video ? video.height : height;
    
    // Scale keypoint positions (same as in video.js)
    const scaleX = width / videoWidth;
    const scaleY = height / videoHeight;
    const keypointX = width - keypoint.x * scaleX; // flipped
    const keypointY = keypoint.y * scaleY;
    
    const distance = dist(keypointX, keypointY, targetX, targetY);
    
    console.log(`${key}: keypoint(${keypointX.toFixed(0)}, ${keypointY.toFixed(0)}) target(${targetX.toFixed(0)}, ${targetY.toFixed(0)}) dist=${distance.toFixed(0)} radius=${HIT_ZONE_RADIUS}`);
    
    if (distance <= HIT_ZONE_RADIUS) {
      matchedPoints++;
    } else {
      missedParts.push(key);
    }
  }

  console.log(`Matched ${matchedPoints}/${totalPoints} points`);
  
  // Need at least 75% of points to match
  const successThreshold = totalPoints * 0.75;
  const valid = matchedPoints >= successThreshold;
  
  let message;
  if (valid) {
    message = `Parfait ! ${matchedPoints}/${totalPoints} points`;
  } else {
    message = `Trop loin ! ${matchedPoints}/${totalPoints} points`;
  }

  return { valid, message, matchedPoints, totalPoints };
}

/**
 * Check if all required keypoints have sufficient confidence (legacy, not used with zone method)
 */
function hasRequiredKeypoints(kp) {
  const required = [5, 6, 7, 8, 9, 10, 11, 12]; // shoulders, elbows, wrists, hips
  return required.every(i => kp[i].confidence > MIN_CONFIDENCE);
}

/**
 * Get the video dimensions (needs to match video.js)
 */
function getVideoDimensions() {
  // Must match the video size in video.js
  return { width: 640, height: 480 };
}

/**
 * Get the pose name from the current pose image
 * @param {Object} poseImage - The current pose image object
 * @returns {string} The pose name ('T', 'Y', or 'L')
 */
function getPoseNameFromImage(poseImage) {
  console.log("Getting pose name from image:", poseImage);
  
  // Extract from the placeholder text in the image URL
  if (!poseImage || !poseImage.canvas || !poseImage.canvas.src) {
    console.log("No valid image source, defaulting to T");
    return 'T'; // default
  }
  
  const src = poseImage.canvas.src;
  console.log("Image source:", src);
  
  if (src.includes('Pose+T')) {
    console.log("Detected T pose");
    return 'T';
  }
  if (src.includes('Pose+Y')) {
    console.log("Detected Y pose");
    return 'Y';
  }
  if (src.includes('Pose+L')) {
    console.log("Detected L pose");
    return 'L';
  }
  
  console.log("No pose detected in URL, defaulting to T");
  return 'T'; // default
}

/**
 * Handle pose validation at the end of countdown
 * Called from move.js when the pause timer ends
 */
function handlePoseValidation() {
  if (typeof getCurrentPoses !== 'function') {
    console.error("getCurrentPoses function not found");
    return;
  }
  
  const poses = getCurrentPoses();
  // Use the currentTargetPose variable directly from move.js
  const targetPose = typeof currentTargetPose !== 'undefined' ? currentTargetPose : 'T';
  
  console.log("Validating against target pose:", targetPose);
  
  const result = validatePose(poses, targetPose);
  
  if (result.valid) {
    // Success - show congratulations
    showPoseResult(true, result.message);
  } else {
    // Failure - remove a life
    showPoseResult(false, result.message);
    loseLife();
  }
}

/**
 * Display the pose validation result
 */
function showPoseResult(success, message) {
  // This will be displayed briefly before the game resumes
  console.log(success ? "✓" : "✗", message);
  
  // Store for display
  if (typeof window !== 'undefined') {
    window.lastPoseResult = { success, message, time: millis() };
  }
}

/**
 * Remove a life from the player
 */
function loseLife() {
  if (typeof playerLives !== 'undefined') {
    playerLives--;
    if (playerLives <= 0) {
      triggerGameOver();
    }
  }
}
