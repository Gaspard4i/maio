import { canvas, maxWidth, maxHeight } from './canvas.js';
import { Entity } from './entity.js';
import { camera } from './camera.js';

///////////////////CONSTANTES///////////////////
const PLAYER_COLOR = 'rgba(255, 255, 255)';
const BASE_PLAYER_SPEED = 10;
const ACCELERATED_SPEED = 15;
const FRICTION = 0.9;

///////////////////CLASSE PLAYER///////////////////
export class PlayerDraw {
	constructor(player) {
		this.vx = player.vx;
		this.vy = player.vy;
		this.speed = player.speed;
		this.keys = player.keys;
		this.useKeyboard = player.useKeyboard;
		this.isAccelerating = player.isAccelerating;
		this.isSliding = player.isSliding;
	}

	///////////////////AFFICHAGE///////////////////
	draw(context) {
		context.fillStyle = PLAYER_COLOR;
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		context.fill();

		if (!this.useKeyboard) {
			context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
			context.lineWidth = 2;
			const maxDistance = Math.min(canvas.width, canvas.height) / 4;
			context.beginPath();
			context.arc(this.x, this.y, maxDistance, 0, 2 * Math.PI);
			context.stroke();
		}
	}

}

export function handleKeyDown(event) {
	if (event.key === 'Shift') {
		player.keys['Shift'] = true;
	} else {
		player.keys[event.key] = true;
		if (player.useKeyboard) player.updateVelocity();
	}
}

export function handleKeyUp(event) {
	if (event.key === 'Shift') {
		player.keys['Shift'] = false;
	} else {
		player.keys[event.key] = false;
		if (player.useKeyboard) {
			player.isSliding = true;
		}
	}
}

///////////////////ÉVÉNEMENTS///////////////////
canvas.addEventListener('mousemove', event => {
	const dx = event.offsetX + camera.x - player.x;
	const dy = event.offsetY + camera.y - player.y;
	player.updateMouseMovement(dx, dy);
});

canvas.addEventListener('mousedown', () => {
	player.useMouse = true;
});

canvas.addEventListener('touchmove', event => {
	const touch = event.touches[0];
	const rect = canvas.getBoundingClientRect();
	const touchX = touch.clientX - rect.left + camera.x;
	const touchY = touch.clientY - rect.top + camera.y;

	const dx = touchX - player.x;
	const dy = touchY - player.y;
	player.updateMouseMovement(dx, dy);
});

canvas.addEventListener('touchstart', event => {
	const touch = event.touches[0];
	const rect = canvas.getBoundingClientRect();
	const touchX = touch.clientX - rect.left + camera.x;
	const touchY = touch.clientY - rect.top + camera.y;

	const dx = touchX - player.x;
	const dy = touchY - player.y;
	player.updateMouseMovement(dx, dy);

	player.useMouse = true;
});

export function drawPlayer(context) {
	player.draw(context);
}
