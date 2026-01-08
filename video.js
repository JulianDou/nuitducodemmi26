/**
 * video.js - Body Pose Detection for the Game
 * Handles webcam capture and ml5.js bodyPose detection
 * Used during "Hole in the Wall" pause events
 */

let video;
let bodyPose;
let poses = [];
let connections;
let videoReady = false;
let bodyPoseReady = false;

/**
 * Preload the bodyPose model (called from move.js preload)
 */
function preloadBodyPose() {
  bodyPose = ml5.bodyPose("MoveNet", modelLoaded);
}

/**
 * Callback when bodyPose model is loaded
 */
function modelLoaded() {
  console.log("BodyPose model loaded!");
  bodyPoseReady = true;
  // If video is already ready, start detection
  if (videoReady && video) {
    startPoseDetection();
  }
}

/**
 * Initialize the webcam and start pose detection (called from initPlayer)
 */
function initBodyPoseCamera() {
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.hide();
  videoReady = true;
  
  // If bodyPose model is already loaded, start detection
  if (bodyPoseReady && bodyPose) {
    startPoseDetection();
  }
}

/**
 * Start pose detection (called when both video and model are ready)
 */
function startPoseDetection() {
  bodyPose.detectStart(video, gotPoses);
  connections = bodyPose.getSkeleton();
  console.log("Pose detection started!");
}

/**
 * Draw the stickman based on body pose skeleton (called during pause)
 */
function drawBodyPose() {
  if (!videoReady || !video) return;

  // Don't draw the video feed - just the skeleton stickman
  // image(video, 0, 0, width, height);

  // Calculate scale factors for keypoint positions
  let scaleX = width / video.width;
  let scaleY = height / video.height;

  // Draw basic stickman (circle head + thick lines for body/limbs)
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    let kp = pose.keypoints;
    
    // Helper function to get scaled position
    const getPos = (keypoint) => ({
      x: width - keypoint.x * scaleX,
      y: keypoint.y * scaleY
    });
    
    // Only draw if we have confident keypoints
    if (kp[0].confidence > 0.1) {
      // Draw head (using nose position)
      let nose = getPos(kp[0]);
      fill(100, 150, 255);
      noStroke();
      circle(nose.x, nose.y, 250);
    }
    
    // Draw torso (shoulders to hips)
    const stickmanWeight = 30;

    if (kp[5].confidence > 0.1 && kp[6].confidence > 0.1 && 
        kp[11].confidence > 0.1 && kp[12].confidence > 0.1) {
      let leftShoulder = getPos(kp[5]);
      let rightShoulder = getPos(kp[6]);
      let leftHip = getPos(kp[11]);
      let rightHip = getPos(kp[12]);
      
      stroke(100, 150, 255);
      strokeWeight(stickmanWeight);
      
      // Shoulders line
      line(leftShoulder.x, leftShoulder.y, rightShoulder.x, rightShoulder.y);
      // Hips line
      line(leftHip.x, leftHip.y, rightHip.x, rightHip.y);
      // Left side
      line(leftShoulder.x, leftShoulder.y, leftHip.x, leftHip.y);
      // Right side
      line(rightShoulder.x, rightShoulder.y, rightHip.x, rightHip.y);
    }
    
    // Draw left arm
    if (kp[5].confidence > 0.1 && kp[7].confidence > 0.1) {
      let shoulder = getPos(kp[5]);
      let elbow = getPos(kp[7]);
      stroke(100, 150, 255);
      strokeWeight(stickmanWeight);
      line(shoulder.x, shoulder.y, elbow.x, elbow.y);
    }
    if (kp[7].confidence > 0.1 && kp[9].confidence > 0.1) {
      let elbow = getPos(kp[7]);
      let wrist = getPos(kp[9]);
      stroke(100, 150, 255);
      strokeWeight(stickmanWeight);
      line(elbow.x, elbow.y, wrist.x, wrist.y);
    }
    
    // Draw right arm
    if (kp[6].confidence > 0.1 && kp[8].confidence > 0.1) {
      let shoulder = getPos(kp[6]);
      let elbow = getPos(kp[8]);
      stroke(100, 150, 255);
      strokeWeight(stickmanWeight);
      line(shoulder.x, shoulder.y, elbow.x, elbow.y);
    }
    if (kp[8].confidence > 0.1 && kp[10].confidence > 0.1) {
      let elbow = getPos(kp[8]);
      let wrist = getPos(kp[10]);
      stroke(100, 150, 255);
      strokeWeight(stickmanWeight);
      line(elbow.x, elbow.y, wrist.x, wrist.y);
    }
    
    // Draw left leg
    if (kp[11].confidence > 0.1 && kp[13].confidence > 0.1) {
      let hip = getPos(kp[11]);
      let knee = getPos(kp[13]);
      stroke(100, 150, 255);
      strokeWeight(stickmanWeight);
      line(hip.x, hip.y, knee.x, knee.y);
    }
    if (kp[13].confidence > 0.1 && kp[15].confidence > 0.1) {
      let knee = getPos(kp[13]);
      let ankle = getPos(kp[15]);
      stroke(100, 150, 255);
      strokeWeight(stickmanWeight);
      line(knee.x, knee.y, ankle.x, ankle.y);
    }
    
    // Draw right leg
    if (kp[12].confidence > 0.1 && kp[14].confidence > 0.1) {
      let hip = getPos(kp[12]);
      let knee = getPos(kp[14]);
      stroke(100, 150, 255);
      strokeWeight(stickmanWeight);
      line(hip.x, hip.y, knee.x, knee.y);
    }
    if (kp[14].confidence > 0.1 && kp[16].confidence > 0.1) {
      let knee = getPos(kp[14]);
      let ankle = getPos(kp[16]);
      stroke(100, 150, 255);
      strokeWeight(stickmanWeight);
      line(knee.x, knee.y, ankle.x, ankle.y);
    }
  }
}

/**
 * Callback function for when bodyPose outputs data
 */
function gotPoses(results) {
  poses = results;
}

/**
 * Get the current poses array (for pose validation)
 * @returns {Array} Array of detected poses
 */
function getCurrentPoses() {
  return poses;
}

/**
 * Check if a person is detected in the frame
 * @returns {boolean} True if at least one pose is detected
 */
function isPersonDetected() {
  return poses.length > 0;
}

/**
 * Get a specific keypoint by name from the first detected pose
 * Keypoint names: nose, left_eye, right_eye, left_ear, right_ear,
 * left_shoulder, right_shoulder, left_elbow, right_elbow,
 * left_wrist, right_wrist, left_hip, right_hip,
 * left_knee, right_knee, left_ankle, right_ankle
 * @param {string} name - The name of the keypoint
 * @returns {Object|null} Keypoint object with x, y, confidence or null
 */
function getKeypoint(name) {
  if (poses.length === 0) return null;
  
  const keypointNames = [
    'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
    'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
    'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
    'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
  ];
  
  const index = keypointNames.indexOf(name);
  if (index === -1) return null;
  
  return poses[0].keypoints[index];
}

/**
 * Placeholder for pose validation - to be implemented
 * This will check if the player matches the required pose
 * @param {string} poseName - The name of the pose to validate
 * @returns {boolean} True if pose matches (currently always returns false)
 */
function validatePose(poseName) {
  // TODO: Implement pose validation logic
  // This should compare current keypoints against expected pose configurations
  return false;
}
