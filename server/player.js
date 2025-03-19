import { Entity } from './entity.js';
import { camera } from './camera.js';
import { maxWidth, maxHeight } from '../server/index.js';
import { BonusType } from '../src/bonus.js';

///////////////////CONSTANTES///////////////////
const PLAYER_COLOR = 'rgba(255, 255, 255)';
const BASE_PLAYER_SPEED = 10;
const ACCELERATED_SPEED = 15;
const FRICTION = 0.9;

///////////////////CLASSE PLAYER///////////////////
export class Player extends Entity {
	constructor(radius, x, y, vx, vy, useKeyboard = false) {
		super(radius, x, y);
		this.vx = vx;
		this.vy = vy;
		this.speed = BASE_PLAYER_SPEED;
		this.keys = {};
		this.useKeyboard = useKeyboard;
		this.isAccelerating = false;
		this.isSliding = false;
		this.score = 0;
	}


	movePlayer() {
		player.x += player.vx;
		player.y += player.vy;

		player.applyFriction();

		const radius = player.radius;

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

		camera.x = player.x - canvas.width / 2;
		camera.y = player.y - canvas.height / 2;
	}

	updateMouseMovement(dx, dy, canvaWidth, canvasHeight) {
		if (this.useKeyboard) return;
	
		const maxDistance = Math.min(canvaWidth, canvaHeight) / 4;
		const distance = Math.sqrt(dx * dx + dy * dy);
		const speedFactor = Math.min(distance / maxDistance, 1);
		const speed =
			speedFactor * (this.isAccelerating ? ACCELERATED_SPEED : this.speed);
	
		if (distance > this.radius) {
			this.vx = (dx / distance) * speed;
			this.vy = (dy / distance) * speed;
		} else {
			this.vx = 0;
			this.vy = 0;
		}
	}   

	///////////////////MISE À JOUR///////////////////
	updateSpeed() {
		this.speed = (BASE_PLAYER_SPEED / this.radius) * 30;
		console.log(this.speed);
	}

	grow() {
		this.score += 15;
		this.radius += Math.sqrt(15 / 100);
		console.log('Score = ' + this.score);
		this.updateSpeed();
		camera.adjustZoomForPlayerSize(this.radius);
	}

	bonus(bt) {
		if (bt === BonusType.VITESSE) {
			this.speed += 10;
		} else if (bt === BonusType.TAILLE) {
			this.radius *= 1.5;
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

	applyAcceleration() {
		this.isAccelerating = this.keys['Shift'];
		if (this.isAccelerating) {
			this.radius = Math.max(10, this.radius - 0.1);
		}
	}


	///////////////////DÉPLACEMENT///////////////////
	updateVelocity() {
		if (!this.useKeyboard) return;
		this.applyAcceleration();
		this.vx = 0;
		this.vy = 0;
		const speed = this.isAccelerating ? ACCELERATED_SPEED : this.speed;
		if (this.keys['ArrowRight']) this.vx += speed;
		if (this.keys['ArrowLeft']) this.vx -= speed;
		if (this.keys['ArrowUp']) this.vy -= speed;
		if (this.keys['ArrowDown']) this.vy += speed;

		this.isSliding = false;
	}

	applyFriction() {
		if (this.isSliding) {
			this.vx *= FRICTION;
			this.vy *= FRICTION;

			if (Math.abs(this.vx) < 0.1) this.vx = 0;
			if (Math.abs(this.vy) < 0.1) this.vy = 0;

			if (this.vx === 0 && this.vy === 0) {
				this.isSliding = false;
			}
		}
	}
}
