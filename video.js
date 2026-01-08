let video;

// Initialise la capture vidéo
function initBodyPoseCamera() {
  video = createCapture(VIDEO);
  video.hide();
  console.log('Video capture initialized');
}

// Affiche la webcam en plein écran, miroir horizontal
function drawBodyPose() {
  if (!video) {
    return;
  }

  push();
  
  // Draw video to fill canvas
  image(video, 0, 0, width, height);
  pop();
}
