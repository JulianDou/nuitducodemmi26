/**
 * assets.js - Asset Management System
 * Handles loading and managing themed assets (backgrounds, obstacles, objects, sky)
 */

// Current theme being used
let currentTheme = 1;
let totalThemes = 1; // Will be updated when we detect more themes

// Asset containers
let themeAssets = {};

// Background scrolling variables
let backgroundScrollY = 0;
let backgroundScrollSpeed = 2;

/**
 * Preloads all assets for available themes
 * Should be called in preload()
 */
function preloadAssets() {
  // For now, load theme 1
  // In the future, you can scan for more theme folders
  loadTheme(1);
}

/**
 * Loads all assets for a specific theme
 * @param {number} themeNumber - The theme number to load
 */
function loadTheme(themeNumber) {
  const themePath = `assets/${themeNumber}/`;
  
  themeAssets[themeNumber] = {
    sky: loadImage(`${themePath}sky.jpg`),
    obstacles: [],
    objects: []
  };
  
  // Load only the obstacle assets that exist
  // obstacle_1.png, obstacle_2.png
  for (let i = 1; i <= 2; i++) {
    let img = loadImage(`${themePath}obstacle_${i}.png`);
    themeAssets[themeNumber].obstacles.push(img);
  }
  
  // Load only the object assets that exist
  // object_1.png
  let objImg = loadImage(`${themePath}object_1.png`);
  themeAssets[themeNumber].objects.push(objImg);
}

/**
 * Switches to a new random theme
 * Called after each pose validation
 */
function switchToNewTheme() {
  // For now with only one theme, just reload it
  // In the future: currentTheme = (currentTheme % totalThemes) + 1;
  currentTheme = 1;
  
  // Preload new theme if not already loaded
  if (!themeAssets[currentTheme]) {
    loadTheme(currentTheme);
  }
  
  // Reset background scroll position for new theme
  backgroundScrollY = 0;
}

/**
 * Gets the current theme's assets
 * @returns {Object} Current theme's assets
 */
function getCurrentThemeAssets() {
  return themeAssets[currentTheme] || null;
}

/**
 * Gets a random obstacle image from current theme
 * @returns {p5.Image} Random obstacle image
 */
function getRandomObstacle() {
  const assets = getCurrentThemeAssets();
  if (assets && assets.obstacles && assets.obstacles.length > 0) {
    let idx = floor(random(assets.obstacles.length));
    return assets.obstacles[idx];
  }
  return null;
}

/**
 * Gets a random object/decor image from current theme
 * @returns {p5.Image} Random object image
 */
function getRandomObject() {
  const assets = getCurrentThemeAssets();
  if (assets && assets.objects && assets.objects.length > 0) {
    let idx = floor(random(assets.objects.length));
    return assets.objects[idx];
  }
  return null;
}

/**
 * Draws the sky background at the top
 * Takes full width and top 1/3 of screen height
 */
function drawSky() {
  const assets = getCurrentThemeAssets();
  if (assets && assets.sky) {
    // Draw sky at the top portion of the screen (top 1/3)
    let skyHeight = height / 3;
    push();
    imageMode(CORNER);
    image(assets.sky, 0, 0, width, skyHeight);
    pop();
  }
}

/**
 * Updates the scrolling background position
 */
function updateBackgroundScroll() {
  if (!isPaused && !gameOver) {
    backgroundScrollY += backgroundScrollSpeed;
    
    // Get background image height
    const assets = getCurrentThemeAssets();
    if (assets && assets.background) {
      // Reset when we've scrolled a full screen height
      if (backgroundScrollY >= height) {
        backgroundScrollY = 0;
      }
    }
  }
}

/**
 * Draws the scrolling background (ground/terrain)
 * Starts from bottom and scrolls up to simulate movement
 * Takes full width and only bottom 2/3 of screen height
 */
function drawScrollingBackground() {
  const assets = getCurrentThemeAssets();
  if (!assets || !assets.background) {
    return;
  }
  
  let bg = assets.background;
  let trackTop = height / 3; // Start drawing from horizon line
  let trackHeight = height - trackTop; // Bottom 2/3 of screen
  
  // Calculate scale to fit the full width
  let bgAspect = bg.width / bg.height;
  let scaledWidth = width; // Full width
  let scaledHeight = scaledWidth / bgAspect;
  
  // Position at left edge (full width)
  let xPos = 0;
  
  push();
  // Simple approach: tile the background vertically for seamless scrolling
  let imgHeight = scaledHeight;
  let y1 = trackTop + (backgroundScrollY % imgHeight) - imgHeight;
  
  // Draw multiple instances to cover the entire bottom 2/3
  image(bg, xPos, y1, scaledWidth, imgHeight);
  image(bg, xPos, y1 + imgHeight, scaledWidth, imgHeight);
  
  // If needed, draw a third instance
  if (y1 + imgHeight * 2 < height) {
    image(bg, xPos, y1 + imgHeight * 2, scaledWidth, imgHeight);
  }
  
  pop();
}
