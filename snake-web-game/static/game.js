// Grab canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 20; // size of each square
let snake = [{ x: 200, y: 200 }];
let dx = box;
let dy = 0;
let score = 0;
let highScore = 0;

// Initialize food
let food = {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box
};

// Overlay for game over screen
const overlay = document.getElementById("gameOverOverlay");

// Get high score from backend
fetch('/highscore')
    .then(res => res.json())
    .then(data => {
        highScore = data.highscore;
        document.getElementById("high").textContent = `High Score: ${highScore}`;
    });

// Drawing loop
let gameLoop = setInterval(draw, 100);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw food
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    // Draw snake
    ctx.fillStyle = "green";
    for (let s of snake) {
        ctx.fillRect(s.x, s.y, box, box);
    }

    // Move snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    // Eat food
    if (head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById("score").textContent = `Score: ${score}`;

        food = {
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (canvas.height / box)) * box
        };
    } else {
        snake.pop(); // remove tail
    }

    // Collision check
    if (
        head.x < 0 || head.x >= canvas.width ||
        head.y < 0 || head.y >= canvas.height ||
        snake.slice(1).some(s => s.x === head.x && s.y === head.y)
    ) {
        clearInterval(gameLoop);
        overlay.style.display = "flex";

        // Save high score if it's new
        fetch('/highscore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score: score })
        });
    }
}

// Control snake direction
function changeDirection(e) {
    if (e.key === "ArrowUp" && dy === 0) {
        dx = 0; dy = -box;
    } else if (e.key === "ArrowDown" && dy === 0) {
        dx = 0; dy = box;
    } else if (e.key === "ArrowLeft" && dx === 0) {
        dx = -box; dy = 0;
    } else if (e.key === "ArrowRight" && dx === 0) {
        dx = box; dy = 0;
    }
}

document.addEventListener("keydown", changeDirection);

// Game over buttons
function restartGame() {
    document.location.reload();
}

function endGame() {
    overlay.style.display = "none";
}
