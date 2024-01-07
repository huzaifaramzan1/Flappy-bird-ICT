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
    programLoadSound = loadSound('assets/Oo ki haal chaal aye theek ho na bhola record.wav');
}

function setup() {
    createCanvas(400, 600);
    bird = new Bird();

    if (isFirstLoad) {
        programLoadSound.play();
        isFirstLoad = false;
    }

    // Add touch event listener for mobile
    document.addEventListener('touchstart', handleTouch);
}

// Handle touch events
function handleTouch() {
    if (!gameStarted) {
        gameStarted = true;
        points = 0;
        pipes = [];
        bird.startGravity();
        jumpSound.play();
    } else if (isGameOver) {
        gameStarted = false;
        isGameOver = false;
    } else {
        bird.up();
    }
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
                hitSound.play();
                gamePaused();
            } else if (pipes[i].passed(bird)) {
                points++;
                pointSound.play();
            }

            if (pipes[i].offscreen()) {
                pipes.splice(i, 1);
            }
        }
    } else if (!gameStarted) {
        textAlign(CENTER);
        textSize(32);
        fill(255);
        text("Press SPACE or tap to start", width / 2, height / 2);

        // Reset the bird's position when game is not started
        bird.resetPosition(width / 4, height / 2);
    } else if (isGameOver) {
        textAlign(CENTER);
        textSize(16);
        fill(255, 145, 0);
        text("Game Over, press spacebar or tap to restart", width / 2, height / 2 + 20);
        textSize(24);
        text("Points: " + points, width / 2, height / 2 + 80);
    }

    textAlign(RIGHT);
    textSize(24);
    fill(255);
    text("Points: " + points, width - 20, 30);
}

function keyPressed() {
    if ((key === ' ' && !gameStarted) || (touches.length > 0 && !gameStarted)) {
        gameStarted = true;
        points = 0;
        pipes = [];
        bird.startGravity();
        jumpSound.play();
        touches = [];
    } else if (key === ' ' && gameStarted && isGameOver) {
        gameStarted = false;
        isGameOver = false;
    } else if ((key === ' ' && gameStarted) || (touches.length > 0 && gameStarted)) {
        bird.up();
        touches = [];
    }
}

function touchStarted() {
    if (!gameStarted || (gameStarted && isGameOver)) {
        gameStarted = true;
        points = 0;
        pipes = [];
        bird.startGravity();
        jumpSound.play();
    } else if (gameStarted) {
        bird.up();
    }

    return false; // Prevent default behavior of touch events
}

function Bird() {
    this.y = height / 2;
    this.x = width / 4;
    this.velocityY = 0;
    this.gravityActive = false;
    this.tiltAngle = 0;

    this.show = function () {
        push();
        translate(this.x, this.y);
        rotate(radians(this.tiltAngle));
        imageMode(CENTER);
        image(birdImage, 0, 0, 50, 50);
        pop();
    };

    this.resetPosition = function (x, y) {
        this.x = x;
        this.y = y;
        this.velocityY = 0;
    };

    this.startGravity = function () {
        this.gravityActive = true;
    };

    this.up = function () {
        if (this.gravityActive) {
            this.velocityY = -8;
            jumpSound.play();
        }
    };

    this.update = function () {
        if (this.gravityActive) {
            this.velocityY += gravity;
            this.y += this.velocityY;

            this.targetTilt = map(this.velocityY, 0, 8, 0, 15);
            this.tiltAngle = lerp(this.tiltAngle, this.targetTilt, 0.2);

            this.y = constrain(this.y, 0, height);

            if (this.hitsTop() || this.hitsBottom()) {
                hitSound.play();
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
        return (
            bird.x + 10 > this.x && bird.x - 10 < this.x + this.w &&
            (bird.y - 10 < this.top || bird.y + 10 > height - this.bottom)
        );
    };

    this.passed = function (bird) {
        return bird.x > this.x + this.w / 2 && bird.x < this.x + this.speed + this.w / 2;
    };
}

function gamePaused() {
    isGameOver = true;
}
