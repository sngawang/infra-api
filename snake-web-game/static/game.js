// Create animated background particles
function createParticles() {
    const particleContainer = document.querySelector('.bg-particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 5 + 8) + 's';
        particleContainer.appendChild(particle);
    }
}

// Game variables
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 20;

let dx = box;
let dy = 0;
let score = 0;
let highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
let snake = [{ x: 200, y: 200 }];
let food = randomFood();
let gameRunning = true;
const overlay = document.getElementById("gameOverOverlay");

// Initialize game
function initGame() {
    // Initialize high score display
    document.getElementById("high").textContent = `High Score: ${highScore}`;
    
    // Start game loop
    gameLoop = setInterval(draw, 120);
}

// Main game drawing function
function draw() {
    if (!gameRunning) return;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(20, 30, 40, 0.9)');
    gradient.addColorStop(1, 'rgba(40, 20, 60, 0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid();
    
    // Draw food
    drawFood();
    
    // Draw snake
    drawSnake();

    // Move snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Check collision
    if (checkCollision(head)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Check if food is eaten
    if (head.x === food.x && head.y === food.y) {
        eatFood();
    } else {
        snake.pop();
    }
}

// Draw grid on canvas
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= canvas.width; i += box) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    
    for (let i = 0; i <= canvas.height; i += box) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}

// Draw food with glow effect
function drawFood() {
    ctx.shadowColor = '#ff6b6b';
    ctx.shadowBlur = 20;
    
    const foodGradient = ctx.createRadialGradient(
        food.x + box/2, food.y + box/2, 0,
        food.x + box/2, food.y + box/2, box/2
    );
    foodGradient.addColorStop(0, '#ff6b6b');
    foodGradient.addColorStop(1, '#ff4757');
    
    ctx.fillStyle = foodGradient;
    ctx.fillRect(food.x + 2, food.y + 2, box - 4, box - 4);
}

// Draw snake with gradient and glow
function drawSnake() {
    ctx.shadowColor = '#4ecdc4';
    ctx.shadowBlur = 15;
    
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        const alpha = 1 - (i * 0.1); // Fade towards tail
        
        const snakeGradient = ctx.createRadialGradient(
            segment.x + box/2, segment.y + box/2, 0,
            segment.x + box/2, segment.y + box/2, box/2
        );
        
        if (i === 0) {
            // Head - brighter
            snakeGradient.addColorStop(0, '#4ecdc4');
            snakeGradient.addColorStop(1, '#45b7d1');
        } else {
            // Body - dimmer
            snakeGradient.addColorStop(0, `rgba(78, 205, 196, ${alpha})`);
            snakeGradient.addColorStop(1, `rgba(69, 183, 209, ${alpha})`);
        }
        
        ctx.fillStyle = snakeGradient;
        ctx.fillRect(segment.x + 1, segment.y + 1, box - 2, box - 2);
    }
    
    // Reset shadow
    ctx.shadowBlur = 0;
}

// Check for collisions
function checkCollision(head) {
    return (
        head.x < 0 || head.x >= canvas.width ||
        head.y < 0 || head.y >= canvas.height ||
        snake.some(s => s.x === head.x && s.y === head.y)
    );
}

// Handle eating food
function eatFood() {
    score++;
    document.getElementById("score").textContent = `Score: ${score}`;
    food = randomFood();
    
    // Add eating effect
    createEatingEffect(snake[0].x + box/2, snake[0].y + box/2);
}

// Create visual eating effect
function createEatingEffect(x, y) {
    const temp = document.createElement('div');
    temp.style.position = 'absolute';
    temp.style.left = x + 'px';
    temp.style.top = y + 'px';
    temp.style.width = '20px';
    temp.style.height = '20px';
    temp.style.background = 'radial-gradient(circle, #ffff00, transparent)';
    temp.style.borderRadius = '50%';
    temp.style.animation = 'ping 0.5s ease-out';
    temp.style.pointerEvents = 'none';
    temp.style.zIndex = '1000';
    document.body.appendChild(temp);
    
    setTimeout(() => temp.remove(), 500);
}

// Handle game over
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    
    document.getElementById("finalScore").textContent = score;
    overlay.style.display = "flex";

    // Update high score
    if (score > highScore) {
        highScore = score;
        document.getElementById("high").textContent = `High Score: ${highScore}`;
        localStorage.setItem('snakeHighScore', highScore.toString());
    }
}

// Handle direction changes
function changeDirection(e) {
    if (!gameRunning) return;

    switch(e.key) {
        case "ArrowUp":
            if (dy === 0) { dx = 0; dy = -box; }
            break;
        case "ArrowDown":
            if (dy === 0) { dx = 0; dy = box; }
            break;
        case "ArrowLeft":
            if (dx === 0) { dx = -box; dy = 0; }
            break;
        case "ArrowRight":
            if (dx === 0) { dx = box; dy = 0; }
            break;
    }
}

// Restart game
function restartGame() {
    snake = [{ x: 200, y: 200 }];
    dx = box;
    dy = 0;
    score = 0;
    gameRunning = true;
    food = randomFood();

    document.getElementById("score").textContent = `Score: ${score}`;
    overlay.style.display = "none";

    clearInterval(gameLoop);
    gameLoop = setInterval(draw, 120);
}

// End game
function endGame() {
    overlay.style.display = "none";
    gameRunning = false;
    clearInterval(gameLoop);
}

// Generate random food position
function randomFood() {
    const maxX = Math.floor(canvas.width / box);
    const maxY = Math.floor(canvas.height / box);
    let newFood;

    do {
        newFood = {
            x: Math.floor(Math.random() * maxX) * box,
            y: Math.floor(Math.random() * maxY) * box
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));

    return newFood;
}

// Event listeners
document.addEventListener("keydown", changeDirection);

// Initialize game when page loads
document.addEventListener("DOMContentLoaded", function() {
    createParticles();
    initGame();
});