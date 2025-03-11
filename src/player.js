import { canvas, maxWidth, maxHeight } from './canvas.js';
import { Entity } from './entity.js';
import { stains } from './entities.js';
import { camera } from './camera.js';

const HITBOX_COLOR = 'rgba(255, 0, 0, 0.5)'; // Couleur de la bordure de la hitbox
const PLAYER_COLOR = 'rgba(255, 255, 255)'; // Couleur blanche pour le joueur
const STAIN_SIZE = 40;
const PLAYER_SPEED = 5;
const ACCELERATED_SPEED = 15;

export class Player extends Entity {
	constructor(radius, x, y, vx, vy) {
		super(radius, x, y);
		this.color = HITBOX_COLOR;
		this.vx = vx;
		this.vy = vy;
		this.speed = PLAYER_SPEED;
		this.score = 0;
		this.keys = {};
	}

	draw(context) {
		// Dessiner la hitbox
		context.strokeStyle = this.color;
		context.lineWidth = 2;
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		context.stroke();

		// Dessiner le joueur
		context.fillStyle = PLAYER_COLOR;
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		context.fill();
	}

	slow() {
		this.speed = PLAYER_SPEED / Math.sqrt(this.radius / 30);
		console.log(this.speed);
	}

	grow() {
		const maxRadius = Math.min(canvas.width, canvas.height) / 2;
		this.radius = Math.min(this.radius + 10, maxRadius);
		this.score += 15;
		console.log('Score = ' + this.score);
		document.querySelector('.score h2').innerHTML = this.score;
		this.slow();
	}

	checkStainCollisionFromCenter() {
		for (let i = stains.length - 1; i >= 0; i--) {
			const stain = stains[i];
			const stainCenterX = stain.x + STAIN_SIZE / 2;
			const stainCenterY = stain.y + STAIN_SIZE / 2;
			const dx = stainCenterX - this.x;
			const dy = stainCenterY - this.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			const stainRadius = STAIN_SIZE / 2;
			const overlap = this.radius - distance + stainRadius;
			if (overlap >= stainRadius * 0.75) {
				stains.splice(i, 1);
				this.grow();
			}
		}
	}

	updateSpeed() {
		this.vx = 0;
		this.vy = 0;
		const speed = this.keys['Shift'] ? ACCELERATED_SPEED : this.speed;
		if (this.keys['ArrowRight']) this.vx += speed;
		if (this.keys['ArrowLeft']) this.vx -= speed;
		if (this.keys['ArrowUp']) this.vy -= speed;
		if (this.keys['ArrowDown']) this.vy += speed;
	}

	updateMouseMovement(dx, dy) {
		const speed = this.keys['Shift'] ? ACCELERATED_SPEED : this.speed;
		const distance = Math.sqrt(dx * dx + dy * dy);
		if (distance > this.radius) {
			this.vx = (dx / distance) * speed;
			this.vy = (dy / distance) * speed;
		} else {
			this.vx = 0;
			this.vy = 0;
		}
	}
}

const player = new Player(30, canvas.width / 2, canvas.height / 2, 0, 0);

export function movePlayer() {
	player.x += player.vx;
	player.y += player.vy;

	const radius = player.radius;
	const canvasWidth = canvas.width;
	const canvasHeight = canvas.height;

	if (player.x - radius < 0) {
		player.x = radius;
	} else if (player.x + radius > maxWidth) {
		player.x = canvasWidth - radius;
	}
	if (player.y - radius < 0) {
		player.y = radius;
	} else if (player.y + radius > maxHeight) {
		player.y = canvasHeight - radius;
	}
	player.checkStainCollisionFromCenter();

	// Update camera position
	camera.x = player.x - canvas.width / 2;
	camera.y = player.y - canvas.height / 2;
}

export function handleKeyDown(event) {
	if (event.key === 'Shift') {
		player.keys['Shift'] = true;
	} else {
		player.keys[event.key] = true;
		player.updateSpeed();
	}
}

export function handleKeyUp(event) {
	if (event.key === 'Shift') {
		player.keys['Shift'] = false;
	} else {
		player.keys[event.key] = false;
		player.updateSpeed();
	}
}

canvas.addEventListener('mousemove', event => {
	const dx = event.offsetX + camera.x - player.x;
	const dy = event.offsetY + camera.y - player.y;
	player.updateMouseMovement(dx, dy);
});

canvas.addEventListener('mousedown', () => {
	player.useMouse = true;
});

export function drawPlayer(context) {
	player.draw(context);
}
