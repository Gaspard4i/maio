import { Entity } from './entity.js';
import { maxWidth, maxHeight } from './constants.js';
import { BonusType } from './bonus.js'; // Correction du chemin

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

	movePlayer(stains) {
		this.x += this.vx;
		this.y += this.vy;

		this.applyFriction();

		const radius = this.radius;

		if (this.x - radius < 0) {
			this.x = radius;
		} else if (this.x + radius > maxWidth) {
			this.x = maxWidth - radius;
		}
		if (this.y - radius < 0) {
			this.y = radius;
		} else if (this.y + radius > maxHeight) {
			this.y = maxHeight - radius;
		}
		this.checkStainCollisionFromCenter(stains);
	}

	updateMouseMovement(dx, dy, canvaWidth, canvaHeight) {
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
		// console.log(this.speed);
	}

	grow() {
		this.score += 15;
		this.radius += Math.sqrt(15 / 100);
		// console.log('Score = ' + this.score);
		this.updateSpeed();
	}

	bonus(bt) {
		if (bt === BonusType.VITESSE) {
			this.speed += 10;
		} else if (bt === BonusType.TAILLE) {
			this.radius *= 1.5;
		}
	}

	checkStainCollisionFromCenter(stains) {
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
