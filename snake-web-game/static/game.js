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
let highScore = 0;
let snake = [{ x: 200, y: 200 }];
let food = randomFood();
let gameRunning = false;
let gameStarted = false;
let gamePaused = false;
let gameLoop;

const overlay = document.getElementById("gameOverOverlay");
const startOverlay = document.getElementById("startGameOverlay");
const pauseIndicator = document.getElementById("pauseIndicator");

// API functions for backend communication
async function fetchHighScore() {
    try {
        const response = await fetch('/api/high-score');
        const data = await response.json();
        return data.highScore;
    } catch (error) {
        console.error('Error fetching high score:', error);
        return 0;
    }
}

async function saveHighScore(score, playerName = 'Anonymous') {
    try {
        const response = await fetch('/api/high-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                score: score,
                playerName: playerName
            })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error saving high score:', error);
        return null;
    }
}

async function fetchLeaderboard() {
    try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
}

// Initialize game
async function initGame() {
    // Load high score from backend
    highScore = await fetchHighScore();
    document.getElementById("high").textContent = `High Score: ${highScore}`;
    
    // Draw initial state
    drawInitialState();
    
    // Show start game overlay
    startOverlay.style.display = "flex";
}

// Draw initial game state (paused)
function drawInitialState() {
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
}

// Start the game
function startGame() {
    gameStarted = true;
    gameRunning = true;
    gamePaused = false;
    startOverlay.style.display = "none";
    pauseIndicator.style.display = "none";
    
    // Start game loop
    gameLoop = setInterval(draw, 120);
}

// Pause/Resume game
function togglePause() {
    if (!gameStarted || !gameRunning) return;
    
    if (gamePaused) {
        // Resume game
        gamePaused = false;
        pauseIndicator.style.display = "none";
        gameLoop = setInterval(draw, 120);
    } else {
        // Pause game
        gamePaused = true;
        pauseIndicator.style.display = "block";
        clearInterval(gameLoop);
    }
}

// Main game drawing function
function draw() {
    if (!gameRunning || gamePaused) return;

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
async function gameOver() {
    gameRunning = false;
    gameStarted = false;
    gamePaused = false;
    clearInterval(gameLoop);
    
    document.getElementById("finalScore").textContent = score;
    pauseIndicator.style.display = "none";

    // Save score to backend if it's a new high score
    if (score > highScore) {
        const playerName = prompt("New High Score! Enter your name:") || "Anonymous";
        const result = await saveHighScore(score, playerName);
        
        if (result && result.success) {
            highScore = result.highScore;
            document.getElementById("high").textContent = `High Score: ${highScore}`;
            
            if (result.isNewRecord) {
                // Add celebration effect for new record
                createCelebrationEffect();
            }
        }
    }
    
    overlay.style.display = "flex";
}

// Create celebration effect for new high score
function createCelebrationEffect() {
    const gameOverTitle = document.querySelector('.game-over-title');
    gameOverTitle.textContent = 'NEW HIGH SCORE!';
    gameOverTitle.style.color = '#ffd700';
    gameOverTitle.style.animation = 'pulse 1s ease-in-out infinite';
    
    // Add confetti effect
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
            confetti.style.borderRadius = '50%';
            confetti.style.animation = 'fall 2s linear forwards';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '10000';
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 2000);
        }, i * 100);
    }
}

// Handle direction changes
function changeDirection(e) {
    if (!gameRunning || gamePaused) return;

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
        case " ":
        case "Space":
            e.preventDefault();
            togglePause();
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
    gameStarted = true;
    gamePaused = false;
    food = randomFood();

    document.getElementById("score").textContent = `Score: ${score}`;
    overlay.style.display = "none";
    pauseIndicator.style.display = "none";
    
    // Reset game over title
    document.querySelector('.game-over-title').textContent = 'GAME OVER';
    document.querySelector('.game-over-title').style.color = '#ff6b6b';
    document.querySelector('.game-over-title').style.animation = 'none';

    clearInterval(gameLoop);
    gameLoop = setInterval(draw, 120);
}

// End game
function endGame() {
    overlay.style.display = "none";
    startOverlay.style.display = "flex";
    gameRunning = false;
    gameStarted = false;
    gamePaused = false;
    clearInterval(gameLoop);
    
    // Reset game state
    snake = [{ x: 200, y: 200 }];
    dx = box;
    dy = 0;
    score = 0;
    food = randomFood();
    document.getElementById("score").textContent = `Score: ${score}`;
    
    // Reset game over title
    document.querySelector('.game-over-title').textContent = 'GAME OVER';
    document.querySelector('.game-over-title').style.color = '#ff6b6b';
    document.querySelector('.game-over-title').style.animation = 'none';
    
    // Draw initial state
    drawInitialState();
}

// Show leaderboard
async function showLeaderboard() {
    const leaderboard = await fetchLeaderboard();
    let leaderboardHTML = '<h3>Top 10 Scores</h3><ul>';
    
    leaderboard.forEach((entry, index) => {
        const date = new Date(entry.timestamp).toLocaleDateString();
        leaderboardHTML += `<li>${index + 1}. ${entry.playerName} - ${entry.score} (${date})</li>`;
    });
    
    leaderboardHTML += '</ul>';
    
    // Create leaderboard modal
    const modal = document.createElement('div');
    modal.className = 'leaderboard-modal';
    modal.innerHTML = `
        <div class="leaderboard-content">
            ${leaderboardHTML}
            <button onclick="closeLeaderboard()" class="game-btn btn-end">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Close leaderboard
function closeLeaderboard() {
    const modal = document.querySelector('.leaderboard-modal');
    if (modal) {
        modal.remove();
    }
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

// Add CSS for leaderboard modal
const leaderboardCSS = `
    .leaderboard-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .leaderboard-content {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        padding: 30px;
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        max-width: 400px;
        width: 90%;
    }
    
    .leaderboard-content h3 {
        text-align: center;
        margin-bottom: 20px;
        font-size: 1.5rem;
        color: #4ecdc4;
    }
    
    .leaderboard-content ul {
        list-style: none;
        padding: 0;
        margin-bottom: 20px;
    }
    
    .leaderboard-content li {
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        font-family: 'Orbitron', monospace;
    }
    
    .leaderboard-content li:nth-child(1) { color: #ffd700; }
    .leaderboard-content li:nth-child(2) { color: #c0c0c0; }
    .leaderboard-content li:nth-child(3) { color: #cd7f32; }
    
    @keyframes fall {
        to { transform: translateY(100vh) rotate(360deg); }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;

// Add CSS to head
const style = document.createElement('style');
style.textContent = leaderboardCSS;
document.head.appendChild(style);

// Event listeners
document.addEventListener("keydown", changeDirection);

// Initialize game when page loads
document.addEventListener("DOMContentLoaded", function() {
    createParticles();
    initGame();
});