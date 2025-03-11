import { canvas } from './canvas.js';
import { position,IMAGE_SIZE } from './imageLoader.js';

let radius = 30;
let x = canvas.width / 2;
let y = canvas.height / 2;
let vx = 0;
let vy = 0;

function slow() {
	vx *= 0.5;
	vy *= 0.5;
}

function grow() {
	radius += 5;
	slow();
}

function checkStainCollisionFromCenter() {
	for (let i = 0; i < position.length; i++) {
		let stainCenterX = position[i][0] + IMAGE_SIZE / 2;
		let stainCenterY = position[i][1] + IMAGE_SIZE / 2;

		let dx = stainCenterX - x;
        let dy = stainCenterY - y;
        let distance = Math.sqrt(dx * dx + dy * dy);
		if (distance <= radius) {
			position.splice(i, 1);
			i--;
			grow();
		}
	}
}


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
	checkStainCollisionFromCenter();
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
	context.fill();
	context.stroke();
}
