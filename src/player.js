import { canvas, maxWidth, maxHeight } from './canvas.js';
import { Entity } from './entity.js';
import { stains } from './entities.js';
import { camera, adjustZoomForPlayerSize } from './camera.js';
import { Bonus, BonusType } from './bonus.js';

///////////////////CONSTANTES///////////////////
const PLAYER_COLOR = 'rgba(255, 255, 255)';
const STAIN_SIZE = 40;
const BASE_PLAYER_SPEED = 5;
const ACCELERATED_SPEED = 15;

///////////////////CLASSE PLAYER///////////////////
export class Player extends Entity {
	constructor(radius, x, y, vx, vy, useKeyboard = false) {
		super(radius, x, y);
		this.vx = vx;
		this.vy = vy;
		this.speed = BASE_PLAYER_SPEED;
		this.score = 0;
		this.keys = {};
		this.useKeyboard = useKeyboard;
	}

	///////////////////AFFICHAGE///////////////////
	draw(context) {
		context.fillStyle = PLAYER_COLOR;
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		context.fill();
	}

	///////////////////MISE À JOUR///////////////////
	updateSpeed() {
		this.speed = (BASE_PLAYER_SPEED / this.radius) * 30;
		console.log(this.speed);
	}

	grow() {
		this.score += 10;
		this.radius += Math.sqrt(this.score * 1.1) * 1.1;
		console.log('Score = ' + this.score);
		document.querySelector('.score h2').innerHTML = this.score;
		this.updateSpeed();
		camera.adjustZoomForPlayerSize(player.radius);
	}

	bonus(bt) {
		if (bt === BonusType.VITESSE) {
			this.speed += 10;
		} else if (bt === BonusType.TAILLE) {
			this.radius += 5;
		}
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
				if (stain instanceof Bonus) this.bonus(stain.bonus);
			}
		}
	}

	///////////////////DÉPLACEMENT///////////////////
	updateVelocity() {
		if (!this.useKeyboard) return;

		this.vx = 0;
		this.vy = 0;
		const speed = this.keys['Shift'] ? ACCELERATED_SPEED : this.speed;
		if (this.keys['ArrowRight']) this.vx += speed;
		if (this.keys['ArrowLeft']) this.vx -= speed;
		if (this.keys['ArrowUp']) this.vy -= speed;
		if (this.keys['ArrowDown']) this.vy += speed;

		if (this.keys['Shift']) {
			this.radius = Math.max(10, this.radius - 0.1);
		}
	}

	updateMouseMovement(dx, dy) {
		if (this.useKeyboard) return;

		const maxDistance = Math.min(canvas.width, canvas.height) / 4;
		const distance = Math.sqrt(dx * dx + dy * dy);
		const speedFactor = Math.min(distance / maxDistance, 1);
		const speed =
			speedFactor * (this.keys['Shift'] ? ACCELERATED_SPEED : this.speed);

		if (distance > this.radius) {
			this.vx = (dx / distance) * speed;
			this.vy = (dy / distance) * speed;
		} else {
			this.vx = 0;
			this.vy = 0;
		}

		if (this.keys['Shift']) {
			this.radius = Math.max(10, this.radius - 0.1);
		}
	}
}

///////////////////INITIALISATION///////////////////
const player = new Player(30, canvas.width / 2, canvas.height / 2, 0, 0, false);

///////////////////FONCTIONS GLOBALES///////////////////
export function movePlayer() {
	player.x += player.vx;
	player.y += player.vy;

	const radius = player.radius;
	const canvasWidth = canvas.width;
	const canvasHeight = canvas.height;

	if (player.x - radius < 0) {
		player.x = radius;
	} else if (player.x + radius > maxWidth) {
		player.x = maxWidth - radius;
	}
	if (player.y - radius < 0) {
		player.y = radius;
	} else if (player.y + radius > maxHeight) {
		player.y = maxHeight - radius;
	}
	player.checkStainCollisionFromCenter();
	camera.adjustZoomForPlayerSize(player.radius);

	camera.x = player.x - canvas.width / 2;
	camera.y = player.y - canvas.height / 2;

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
		if (player.useKeyboard) player.updateVelocity();
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
