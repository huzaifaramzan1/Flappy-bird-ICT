let bird;
let pipes = [];
let backgroundImage;
let birdImage;
let pipeImage;
let gravity = 0.6;
let gameStarted = false;
let isGameOver = false;
let points = 0;
let jumpSound;
let hitSound;
let pointSound;
let programLoadSound;
let isFirstLoad = true;

function preload() {
    backgroundImage = loadImage('assets/background-day.png');
    birdImage = loadImage('assets/bird.png');
    pipeImage = loadImage('assets/pipe-green.png');
    hitSound = loadSound('assets/hit.wav');
    jumpSound = loadSound('assets/wing.wav');
    pointSound = loadSound('assets/point.wav');
    programLoadSound = loadSound('assets/swoosh.wav');
}

function setup() {
    createCanvas(400, 600);
    bird = new Bird();
    programLoadSound.play();
}

function draw() {
    background(backgroundImage);

    if (gameStarted && !isGameOver) {
        bird.update();
        bird.show();

        if (frameCount % 75 === 0) {
            pipes.push(new Pipe());
        }

        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].update();
            pipes[i].show();

            if (pipes[i].hits(bird)) {
                hitSound.play(); // Play the hit sound
                gamePaused();
            } else if (pipes[i].passed(bird)) {
                points++;
                pointSound.play(); // Play the point sound
            }

            if (pipes[i].offscreen()) {
                pipes.splice(i, 1);
            }
        }
    } else if (!gameStarted) {
        // Display initial message or anything else you want to show
        textAlign(CENTER);
        textSize(32);
        fill(255);
        text("Press SPACE or Tap to start", width / 2, height / 2);
        bird.show(); // Display bird in the center before starting
    } else if (isGameOver) {
        // Display game over message and points
        textAlign(CENTER);
        textSize(32);
        fill(255, 0, 0);
        text("Game Over", width / 2, height / 2 + 40);
        textSize(24);
        text("Points: " + points, width / 2, height / 2 + 80);
    }

    // Display points on the top right
    textAlign(RIGHT);
    textSize(24);
    fill(255);
    text("Points: " + points, width - 20, 30);
}

function keyPressed() {
    if (key === ' ' && !gameStarted) {
        startGame();
    } else if (key === ' ' && gameStarted && isGameOver) {
        restartGame();
    } else if (key === ' ' && gameStarted) {
        bird.up();
    }
}

function touchStarted() {
    if (!gameStarted) {
        startGame();
    } else if (gameStarted && isGameOver) {
        restartGame();
    } else if (gameStarted) {
        bird.up();
    }
    return false; // prevent default
}

function startGame() {
    gameStarted = true;
    points = 0;
    pipes = [];
    bird = new Bird(); // Reset the bird when the game starts
    bird.startGravity();
    jumpSound.play(); // Play the jump sound
}

function restartGame() {
    gameStarted = false;
    isGameOver = false;
}

function Bird() {
    this.y = height / 2; // Start at the middle of the screen
    this.x = width / 4;
    this.velocityY = 0;
    this.gravityActive = false; // Flag to indicate if gravity should be active
    this.tiltAngle = 0; // Tilt angle
    this.targetTilt = 0; // Target tilt angle

    this.show = function () {
        push();
        translate(this.x, this.y);
        rotate(radians(this.tiltAngle));
        imageMode(CENTER);
        image(birdImage, 0, 0, 50, 50);
        pop();
    };

    this.startGravity = function () {
        this.gravityActive = true;
    };

    this.up = function () {
        if (this.gravityActive) {
            this.velocityY = -8; // Immediate jump
            jumpSound.play(); // Play the jump sound
        }
    };

    this.update = function () {
        if (this.gravityActive) {
            this.velocityY += gravity;
            this.y += this.velocityY;

            // Set the target tilt based on the bird's velocity
            this.targetTilt = map(this.velocityY, 0, 8, 0, 15);

            // Smoothly interpolate the current tilt angle towards the target tilt angle
            this.tiltAngle = lerp(this.tiltAngle, this.targetTilt, 0.2);

            // Prevent bird from going off the screen
            this.y = constrain(this.y, 0, height);

            if (this.hitsTop() || this.hitsBottom()) {
                hitSound.play(); // Play the hit sound
                gamePaused();
            }
        }
    };

    this.hitsTop = function () {
        return this.y - 25 < 0;
    };

    this.hitsBottom = function () {
        return this.y + 25 > height;
    };
}

function Pipe() {
    this.spacing = 125;
    this.top = random(height / 6, (3 / 4) * height);
    this.bottom = height - (this.top + this.spacing);
    this.x = width;
    this.w = 50;
    this.speed = 2;

    this.show = function () {
        imageMode(CORNER);
        image(pipeImage, this.x, 0, this.w, this.top);
        image(pipeImage, this.x, height - this.bottom, this.w, this.bottom);
    };

    this.update = function () {
        this.x -= this.speed;
    };

    this.offscreen = function () {
        return this.x < -this.w;
    };

    this.hits = function (bird) {
        // Check if the bird hits the boundaries of the pipe
        return (
            bird.x + 10 > this.x && bird.x - 10 < this.x + this.w &&
            (bird.y - 10 < this.top || bird.y + 10 > height - this.bottom)
        );
    };

    this.passed = function (bird) {
        // Check if the bird has passed through the pipe
        return bird.x > this.x + this.w / 2 && bird.x < this.x + this.speed + this.w / 2;
    };
}

function gamePaused() {
    isGameOver = true;
    console.log("Game Over");
}
