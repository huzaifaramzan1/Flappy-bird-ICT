function preload() {
    // Load background and image assets
    backgroundImg = loadImage("assets/flappy-bird.gif");
    objectImg = loadImage("assets/pngwing.com.png");
    textSize(50);  // Set text size for "Game Over" message
}

function setup() {
    createCanvas(1320, 600);
    noStroke();

    // Initialize object position and variables
    objectX = width / 2;
    objectY = height / 2;
    ySpeed = 0;
    gravity = 0.5;

    isPaused = false;  // Track paused state
}

function draw() {
    if (!isPaused) {
        // Display background image
        image(backgroundImg, 0, 0, width, height);

        // Apply gravity and update object position
        ySpeed += gravity;
        objectY += ySpeed;

        // Forward movement for the object
        objectX += 2;

        // Check for top and bottom collisions, bounce, and pause
        if (objectY < 0 || objectY > height - objectImg.height) {
            ySpeed *= -0.8;
            if (objectY < 0) {
                objectY = 0;  // Set to top edge if hitting above
            } else {
                objectY = height - objectImg.height;  // Set to bottom edge if hitting below
            }
            isPaused = true;
            noLoop(); // This pauses the draw loop
            textSize(40);  // Set text size
            fill(15, 70, 129);  // Set text color to red
            text("Game Over! press spacebar again to restart", width / 2 - 340, height / 2-  20);  // Adjust for wider text
        }

        // Check if object reaches right edge of screen and reset position
        if (objectX > width) {
            objectX = 0;  // Start from left side again
        }

        // Draw the object image
        image(objectImg, objectX, objectY);
    }
}

// Function to handle spacebar press for jumping and restarting
function keyPressed() {
    if (keyCode === 32) {  // Spacebar key code
        if (isPaused) {
            // Restart the game
            setup();  // Reset game variables
            loop();  // Resume the draw loop
        } else {
            // Trigger a jump
            ySpeed = -10;
        }
    }
}
