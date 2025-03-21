import { Entity } from './entity.js';
import { maxWidth, maxHeight } from './constants.js';
import { BonusType } from './bonus.js'; // Correction du chemin

///////////////////CONSTANTES///////////////////
const BASE_PLAYER_SPEED = 10;
const ACCELERATED_SPEED = 15;
const FRICTION = 0.9;

///////////////////CLASSE PLAYER///////////////////
export class Player extends Entity {
	constructor(radius, x, y, vx, vy, useKeyboard = true) {
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

	updateMouseMovement(dx, dy, canvaWidth, canvasHeight) {
		if (this.useKeyboard) return;

		const maxDistance = Math.min(canvaWidth, canvasHeight) / 4;
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
		// console.log(stains.get(0));
		for (let i = stains.size() - 1; i >= 0; i--) {
			// console.log('check col');
			const stain = stains.get(i);
			const stainCenterX = stain.x + 20 / 2;
			const stainCenterY = stain.y + 20 / 2;
			const dx = stainCenterX - this.x;
			const dy = stainCenterY - this.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			const stainRadius = 20 / 2;
			const overlap = this.radius - distance + stainRadius;
			if (overlap >= stainRadius * 0.75) {
				stains.splice(i, 1);
				this.grow();
				// if (stain instanceof Bonus) this.bonus(stain.bonus);
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
		this.applyAcceleration();
		let dx =
			(this.keys['ArrowRight'] ? 1 : 0) - (this.keys['ArrowLeft'] ? 1 : 0);
		let dy = (this.keys['ArrowDown'] ? 1 : 0) - (this.keys['ArrowUp'] ? 1 : 0);
		const magnitude = Math.sqrt(dx * dx + dy * dy);
		if (magnitude > 0) {
			dx /= magnitude;
			dy /= magnitude;
		}
		const speed = this.isAccelerating ? ACCELERATED_SPEED : this.speed;
		this.vx = dx * speed;
		this.vy = dy * speed;
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
