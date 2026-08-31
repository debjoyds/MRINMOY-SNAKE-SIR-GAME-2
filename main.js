const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const deviceMenu = document.getElementById("deviceMenu");
const gameScreen = document.getElementById("gameScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const mobileBtn = document.getElementById("mobileBtn");
const pcBtn = document.getElementById("pcBtn");

const restartBtn = document.getElementById("restartBtn");
const menuBtn = document.getElementById("menuBtn");

const scoreDisplay = document.getElementById("score");
const finalScoreDisplay = document.getElementById("finalScore");
const speedDisplay = document.getElementById("speedText");

const mobileControls = document.getElementById("mobileControls");
const controlText = document.getElementById("controlText");

const scoreSound = document.getElementById("scoreSound");
const moveSound = document.getElementById("moveSound");
const gameOverSound = document.getElementById("gameOverSound");

/* =========================
IMAGES
========================= */

const headImage = new Image();
headImage.src = "head.png";

const bodyImage = new Image();
bodyImage.src = "body.png";

/* =========================
GAME SETTINGS
========================= */

const GRID_SIZE = 25;

let canvasSize = 600;
let tileSize = canvasSize / GRID_SIZE;

let snake = [];
let food = {};

let direction = "right";
let nextDirection = "right";

let score = 0;

let speedMultiplier = 1.0;

/*
BASE DELAY = SLOW START


Higher delay = slower snake.


*/
const BASE_DELAY = 180;

let gameDelay = BASE_DELAY;

let gameTimer = null;
let gameRunning = false;

let selectedDevice = null;

/* =========================
RESIZE CANVAS
========================= */

function resizeCanvas() {


const container = document.getElementById("gameContainer");

const size = Math.min(
    container.clientWidth,
    container.clientHeight
);

canvas.width = size;
canvas.height = size;

canvasSize = size;
tileSize = canvasSize / GRID_SIZE;

draw();


}

/* =========================
DEVICE SELECTION
========================= */

mobileBtn.addEventListener("click", () => {


selectedDevice = "mobile";

deviceMenu.classList.add("hidden");
gameScreen.classList.remove("hidden");

mobileControls.classList.remove("hidden");

controlText.textContent =
    "Swipe anywhere on the game to move";

resizeCanvas();

startGame();


});

pcBtn.addEventListener("click", () => {


selectedDevice = "pc";

deviceMenu.classList.add("hidden");
gameScreen.classList.remove("hidden");

mobileControls.classList.add("hidden");

controlText.textContent =
    "Use Arrow Keys to move";

resizeCanvas();

startGame();


});

/* =========================
START GAME
========================= */

function startGame() {


clearTimeout(gameTimer);

snake = [

    {
        x: 12,
        y: 12
    },

    {
        x: 11,
        y: 12
    },

    {
        x: 10,
        y: 12
    }

];

direction = "right";
nextDirection = "right";

score = 0;

/*
    IMPORTANT:
    The game starts at exactly 1.00x speed.
*/

speedMultiplier = 1.0;

gameDelay = BASE_DELAY;

updateScore();

createFood();

gameRunning = true;

draw();

gameLoop();


}

/* =========================
GAME LOOP
========================= */

function gameLoop() {


if (!gameRunning) {
    return;
}

gameTimer = setTimeout(() => {

    update();

    if (gameRunning) {
        draw();
        gameLoop();
    }

}, gameDelay);


}

/* =========================
UPDATE GAME
========================= */

function update() {

direction = nextDirection;

const head = {
    x: snake[0].x,
    y: snake[0].y
};


/* MOVE HEAD */

if (direction === "up") {
    head.y--;
}

if (direction === "down") {
    head.y++;
}

if (direction === "left") {
    head.x--;
}

if (direction === "right") {
    head.x++;
}


/* WALL COLLISION */

if (
    head.x < 0 ||
    head.x >= GRID_SIZE ||
    head.y < 0 ||
    head.y >= GRID_SIZE
) {

    endGame();
    return;
}


/* BODY COLLISION */

for (let i = 0; i < snake.length; i++) {

    if (
        head.x === snake[i].x &&
        head.y === snake[i].y
    ) {

        endGame();
        return;
    }
}


/* ADD NEW HEAD */

snake.unshift(head);


/* FOOD */

if (
    head.x === food.x &&
    head.y === food.y
) {

    score++;

    updateScore();

    playSound(scoreSound);

    /*
        SPEED INCREASE:
        
        ONLY when score is a multiple of 4.

        4, 8, 12, 16, 20...
        
        NOT:
        1, 2, 3, 5, 6, 7...
    */

    if (score % 4 === 0) {

        speedMultiplier *= 1.15;

        /*
            Faster speed means smaller delay.
        */

        gameDelay = BASE_DELAY / speedMultiplier;

        updateSpeedDisplay();
    }

    createFood();

    /*
        DO NOT remove the tail.
        Therefore the snake grows by one body image.
    */

} else {

    /*
        No food eaten:
        remove the last segment.
    */

    snake.pop();
}

}

/* =========================
CREATE FOOD
========================= */

function createFood() {


let validPosition = false;

while (!validPosition) {

    food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
    };

    validPosition = true;

    for (let i = 0; i < snake.length; i++) {

        if (
            snake[i].x === food.x &&
            snake[i].y === food.y
        ) {

            validPosition = false;
            break;
        }
    }
}


}

/* =========================
DRAW GAME
========================= */

function draw() {


ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
);


/* BACKGROUND */

ctx.fillStyle = "#181818";

ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
);


/* SUBTLE GRID */

ctx.strokeStyle = "rgba(255,255,255,0.035)";
ctx.lineWidth = 1;

for (let i = 0; i <= GRID_SIZE; i++) {

    const position = i * tileSize;

    ctx.beginPath();

    ctx.moveTo(position, 0);
    ctx.lineTo(position, canvas.height);

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(0, position);
    ctx.lineTo(canvas.width, position);

    ctx.stroke();
}


/* FOOD */

ctx.fillStyle = "#ff3b30";

ctx.beginPath();

ctx.arc(
    food.x * tileSize + tileSize / 2,
    food.y * tileSize + tileSize / 2,
    tileSize * 0.35,
    0,
    Math.PI * 2
);

ctx.fill();


/* SNAKE */

for (let i = snake.length - 1; i >= 0; i--) {

    const part = snake[i];

    const x = part.x * tileSize;
    const y = part.y * tileSize;


    if (i === 0) {

        /*
            HEAD IMAGE
        */

        if (headImage.complete && headImage.naturalWidth > 0) {

            ctx.drawImage(
                headImage,
                x,
                y,
                tileSize,
                tileSize
            );

        } else {

            drawFallbackHead(x, y);
        }


    } else {

        /*
            BODY IMAGE
        */

        if (bodyImage.complete && bodyImage.naturalWidth > 0) {

            ctx.drawImage(
                bodyImage,
                x,
                y,
                tileSize,
                tileSize
            );

        } else {

            drawFallbackBody(x, y);
        }
    }
}


}

/* =========================
FALLBACK HEAD
========================= */

function drawFallbackHead(x, y) {


ctx.fillStyle = "#65ff65";

ctx.fillRect(
    x + 1,
    y + 1,
    tileSize - 2,
    tileSize - 2
);


}

/* =========================
FALLBACK BODY
========================= */

function drawFallbackBody(x, y) {


ctx.fillStyle = "#2ecc71";

ctx.fillRect(
    x + 2,
    y + 2,
    tileSize - 4,
    tileSize - 4
);


}

/* =========================
SCORE DISPLAY
========================= */

function updateScore() {


scoreDisplay.textContent = score;

finalScoreDisplay.textContent = score;


}

/* =========================
SPEED DISPLAY
========================= */

function updateSpeedDisplay() {

speedDisplay.textContent =
    speedMultiplier.toFixed(2) + "x";


}

/* =========================
SOUND
========================= */

function playSound(audio) {


try {

    audio.currentTime = 0;

    const promise = audio.play();

    if (promise !== undefined) {

        promise.catch(() => {
            // Browser may block audio until user interaction.
        });
    }

} catch (error) {
    console.log("Audio error:", error);
}


}

/* =========================
MOVEMENT
========================= */

function changeDirection(newDirection) {


if (!gameRunning) {
    return;
}


/*
    Prevent immediate reverse.

    Example:
    moving RIGHT
    cannot instantly move LEFT.
*/

if (
    newDirection === "up" &&
    direction !== "down"
) {

    if (nextDirection !== "up") {

        nextDirection = "up";

        playSound(moveSound);
    }

    return;
}


if (
    newDirection === "down" &&
    direction !== "up"
) {

    if (nextDirection !== "down") {

        nextDirection = "down";

        playSound(moveSound);
    }

    return;
}


if (
    newDirection === "left" &&
    direction !== "right"
) {

    if (nextDirection !== "left") {

        nextDirection = "left";

        playSound(moveSound);
    }

    return;
}


if (
    newDirection === "right" &&
    direction !== "left"
) {

    if (nextDirection !== "right") {

        nextDirection = "right";

        playSound(moveSound);
    }

    return;
}


}

/* =========================
PC ARROW KEYS
========================= */

document.addEventListener("keydown", (event) => {


if (selectedDevice !== "pc") {
    return;
}

switch (event.key) {

    case "ArrowUp":

        event.preventDefault();
        changeDirection("up");

        break;


    case "ArrowDown":

        event.preventDefault();
        changeDirection("down");

        break;


    case "ArrowLeft":

        event.preventDefault();
        changeDirection("left");

        break;


    case "ArrowRight":

        event.preventDefault();
        changeDirection("right");

        break;
}


});

/* =========================
MOBILE BUTTONS
========================= */

const controlButtons =
document.querySelectorAll(".control");

controlButtons.forEach(button => {


button.addEventListener("pointerdown", (event) => {

    event.preventDefault();

    const newDirection =
        button.dataset.direction;

    changeDirection(newDirection);
});


});

/* =========================
MOBILE SWIPE
========================= */

let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener(
"touchstart",
(event) => {


    if (selectedDevice !== "mobile") {
        return;
    }

    const touch = event.changedTouches[0];

    touchStartX = touch.clientX;
    touchStartY = touch.clientY;

},
{
    passive: false
}


);

canvas.addEventListener(
"touchend",
(event) => {


    if (selectedDevice !== "mobile") {
        return;
    }

    event.preventDefault();

    const touch = event.changedTouches[0];

    const endX = touch.clientX;
    const endY = touch.clientY;

    const differenceX =
        endX - touchStartX;

    const differenceY =
        endY - touchStartY;

    const minimumSwipe = 25;


    /*
        Ignore tiny touches.
    */

    if (
        Math.abs(differenceX) < minimumSwipe &&
        Math.abs(differenceY) < minimumSwipe
    ) {
        return;
    }


    /*
        Horizontal swipe is stronger.
    */

    if (
        Math.abs(differenceX) >
        Math.abs(differenceY)
    ) {

        if (differenceX > 0) {

            changeDirection("right");

        } else {

            changeDirection("left");
        }

    } else {

        if (differenceY > 0) {

            changeDirection("down");

        } else {

            changeDirection("up");
        }
    }

},
{
    passive: false
}


);

/* =========================
GAME OVER
========================= */

function endGame() {


if (!gameRunning) {
    return;
}

gameRunning = false;

clearTimeout(gameTimer);

finalScoreDisplay.textContent = score;

/*
    Play losing sound.
*/

playSound(gameOverSound);

gameScreen.classList.add("hidden");

gameOverScreen.classList.remove("hidden");


}

/* =========================
RESTART
========================= */

restartBtn.addEventListener("click", () => {


gameOverScreen.classList.add("hidden");

gameScreen.classList.remove("hidden");

resizeCanvas();

startGame();


});

/* =========================
MAIN MENU
========================= */

menuBtn.addEventListener("click", () => {


clearTimeout(gameTimer);

gameRunning = false;

gameOverScreen.classList.add("hidden");

gameScreen.classList.add("hidden");

deviceMenu.classList.remove("hidden");

selectedDevice = null;

});

/* =========================
IMAGE LOADING
========================= */

headImage.onload = () => {


draw();


};

bodyImage.onload = () => {


draw();


};

/* =========================
WINDOW RESIZE
========================= */

window.addEventListener("resize", () => {


if (!gameScreen.classList.contains("hidden")) {

    resizeCanvas();
}


});
