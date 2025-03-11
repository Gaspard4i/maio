import { canvas } from './canvas.js';

let radius = 30;
let x = canvas.width / 2;
let y = canvas.height / 2;
let vx = 0;
let vy = 0;
let color = 'rgba(204, 80, 97)';

export function movePlayer() {
	x += vx;
	y += vy;

	if (x - radius < 0) {
		x = radius;
	} else if (x + radius > canvas.width) {
		x = canvas.width - radius;
	}
	if (y - radius < 0) {
		y = radius;
	} else if (y + radius > canvas.height) {
		y = canvas.height - radius;
	}
}

export function handleKeyDown(event) {
	switch (event.key) {
		case 'ArrowRight':
			vx = 15;
			break;
		case 'ArrowLeft':
			vx = -15;
			break;
		case 'ArrowUp':
			vy = -15;
			break;
		case 'ArrowDown':
			vy = 15;
			break;
	}
}

export function handleKeyUp(event) {
	switch (event.key) {
		case 'ArrowRight':
		case 'ArrowLeft':
			vx = 0;
			break;
		case 'ArrowUp':
		case 'ArrowDown':
			vy = 0;
			break;
	}
}

export function drawPlayer(context) {
	context.moveTo(0, 0);
	context.beginPath();
	context.arc(x, y, radius, 0, 2 * Math.PI);
	context.fillStyle = color;
	context.fill();
	context.strokeStyle = color;
	context.stroke();
}
