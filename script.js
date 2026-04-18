const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");

const size = 20;

let snake;
let food;
let direction;
let lastDirection;
let score;
let gameInterval;

const headImg = new Image();
headImg.src = "assets/img/knight_head.png";

function drawHead(x, y) {
    const headSize = size * 1.9;

    ctx.shadowBlur = 40;
    ctx.shadowColor = "#2dfcff";

    ctx.drawImage(
        headImg,
        x - (headSize - size) / 2,
        y - (headSize - size) / 2,
        headSize,
        headSize
    );

    ctx.shadowBlur = 0;
}

function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / size)),
            y: Math.floor(Math.random() * (canvas.height / size))
        };
    } while (snake.some(s => s.x === newFood.x && s.y === newFood.y));
    return newFood;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const fx = food.x * size + size / 2;
    const fy = food.y * size + size / 2;

    const gradientFood = ctx.createRadialGradient(fx, fy, 2, fx, fy, size);

    gradientFood.addColorStop(0, "#ffffff");
    gradientFood.addColorStop(0.3, "#ff7ad9");
    gradientFood.addColorStop(0.7, "#ff4fd8");
    gradientFood.addColorStop(1, "#ff2e88");

    ctx.fillStyle = gradientFood;
    ctx.shadowBlur = 25;
    ctx.shadowColor = "#ff4fd8";

    ctx.beginPath();
    ctx.arc(fx, fy, size / 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    snake.forEach((s, i) => {
        const x = s.x * size;
        const y = s.y * size;

        if (i === 0) {
            drawHead(x, y);
        } else {
            const alpha = 1 - (i / snake.length);

            const gradient = ctx.createRadialGradient(
                x + size / 2,
                y + size / 2,
                1,
                x + size / 2,
                y + size / 2,
                size
            );

            gradient.addColorStop(0, `rgba(125, 249, 255, ${alpha})`);
            gradient.addColorStop(1, `rgba(10, 58, 69, ${alpha})`);

            ctx.fillStyle = gradient;

            ctx.shadowBlur = 10;
            ctx.shadowColor = "#2dfcff";

            roundRect(ctx, x, y, size, size, 6);
            ctx.fill();

            ctx.shadowBlur = 0;
        }
    });
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function move() {
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    if (
        head.x < 0 || head.y < 0 ||
        head.x >= canvas.width / size ||
        head.y >= canvas.height / size ||
        snake.some(s => s.x === head.x && s.y === head.y)
    ) {
        clearInterval(gameInterval);
        restartGame();
        startGame();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreEl.textContent = score;
        food = generateFood();
    } else {
        snake.pop();
    }
}

function gameLoop() {
    if (direction.x === 0 && direction.y === 0) return;
    lastDirection = direction;
    move();
    draw();
}

document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && lastDirection.y === 0) direction = { x: 0, y: -1 };
    if (e.key === "ArrowDown" && lastDirection.y === 0) direction = { x: 0, y: 1 };
    if (e.key === "ArrowLeft" && lastDirection.x === 0) direction = { x: -1, y: 0 };
    if (e.key === "ArrowRight" && lastDirection.x === 0) direction = { x: 1, y: 0 };
});

function restartGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    lastDirection = { x: 0, y: 0 };
    score = 0;
    scoreEl.textContent = score;
    food = generateFood();
    draw();
}

let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener("touchstart", e => {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
}, { passive: true });

canvas.addEventListener("touchmove", e => {
    e.preventDefault();
}, { passive: false });

canvas.addEventListener("touchend", e => {
    const t = e.changedTouches[0];

    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && lastDirection.x === 0) {
            direction = { x: 1, y: 0 };
        } else if (dx < 0 && lastDirection.x === 0) {
            direction = { x: -1, y: 0 };
        }
    } else {
        if (dy > 0 && lastDirection.y === 0) {
            direction = { x: 0, y: 1 };
        } else if (dy < 0 && lastDirection.y === 0) {
            direction = { x: 0, y: -1 };
        }
    }
});

function startGame() {
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 120);
}

restartGame();
startGame();