const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const canvasSize = 600;
canvas.width = canvasSize;
canvas.height = canvasSize;


const box = 20;
let snake = [{x: 200, y: 200}];
let dx = box;
let dy = 0;
let food = {
	x: Math.floor(Math.random() * 20) * box,
	y: Math.floor(Math.random() * 20) * box
};

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.heigh);

	// Draw food
	ctx.fillStyle = "red";
	ctx.fillRect(food.x, food.y, box, box);

	// Draw snake
	for (let s of snake) {
		ctx.fillRect(s.x, s.y, box, box);
	}

	// Move snake
	const head = { x: snake[0].x + dx, y: snake[0].y + dy };
	snake.unshift(head);

	// Check food collision
	if (head.x === food.x && head.y === food.y) {
		food = { 
			x: Math.floor(Math.random() * (canvas.width / box)) * box,
			y: Math.floor(Math.random() * (canvas.height / box)) * box
		};
	} else {
		snake.pop();
	}

	// Wall collision
	if ( head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height || snake.slice(1).some(s => s.x === head.x && s.y === head.y) ) {
		alert("Game Over!");
		document.location.reload();
	}
}

function ChangeDirection(e) {
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

document.addEventListener("keydown", ChangeDirection);
setInterval(draw,100)
