function preload() {
    backgroundImg = loadImage("assets/background-day.png");
    objectImg = loadImage("assets/pngwing.com.png");
    blockImg = loadImage("assets/pipe-green.png");
    blockImg = loadImage("assets/pipe-green.png");
    textSize(50);
}

function setup() {
    createCanvas(700, 700);
    noStroke();

    objectX = width / 4;
    objectY = height / 2;
    ySpeed = 0;
    gravity = 0.5;

    backgroundOffsetX = 0;
    blocks = [];

    isPaused = false;
}

function draw() {
    stopForeground = true;
    imageMode(CORNER);

    if (!isPaused) {
        backgroundOffsetX -= 5;
        image(backgroundImg, backgroundOffsetX, 0, width, height);
        if (backgroundOffsetX < -backgroundImg.width) {
            backgroundOffsetX = 0;
        }

        ySpeed += gravity;
        objectY += ySpeed;

        if (objectY < 0 || objectY > height - objectImg.height) { // Check for top/bottom collision
            isPaused = true;
            noLoop();
            fill(255);
            text("Game Over", width / 2 - 120, height / 2);
        }
        objectX = constrain(objectX, 40, width - 40);

        if (frameCount % 50 === 0) {
            const gapHeight = random(100, height - 400);
            const topBlockY = random(0, height - gapHeight - blockImg.height - objectImg.height);
            blocks.push(new Block(topBlockY, gapHeight));
        }

        for (let i = 0; i < blocks.length; i++) {
            blocks[i].update();
            blocks[i].draw();

            if (blocks[i].isColliding(objectX, objectY, objectImg.width, objectImg.height)) {
                isPaused = true;
                noLoop();
                fill(255);
                text("Game Over", width / 2 - 120, height / 2);
            }
        }

        blocks = blocks.filter(block => block.x > -blockImg.width);

        image(objectImg, objectX, objectY);
    }
}

function keyPressed() {
    if (keyCode === 32) {
        if (isPaused) {
            setup();
            loop();
        } else {
            ySpeed = -10;
        }
    }
}

class Block {
    constructor(topBlockY, gapHeight) {
        this.x = width;
        this.topBlockY = topBlockY;
        this.bottomBlockY = topBlockY + blockImg.height + gapHeight;
    }

    update() {
        this.x -= 5;
    }

    draw() {
        image(blockImg, this.x, this.topBlockY);
        image(blockImg, this.x, this.bottomBlockY);
    }

    isColliding(objectX, objectY, objectWidth, objectHeight) {
        return (
            objectX + objectWidth > this.x &&
            objectX < this.x + blockImg.width &&
            (objectY + objectHeight > this.topBlockY && objectY < this.topBlockY + blockImg.height ||
                objectY + objectHeight > this.bottomBlockY && objectY < this.bottomBlockY + blockImg.height)
        );
    }
}
