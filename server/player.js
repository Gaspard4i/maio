import { Entity } from './entity.js';
import { BonusType } from './bonus.js';
import {
	BASE_PLAYER_SPEED,
	ACCELERATED_SPEED,
	FRICTION,
	MAX_WIDTH,
	MAX_HEIGHT,
} from './constants.js';

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

	movePlayer(stains, grid) {
		this.x += this.vx;
		this.y += this.vy;

		const radius = this.radius;

		if (this.x - radius < 0) {
			this.x = radius;
		} else if (this.x + radius > MAX_WIDTH) {
			this.x = MAX_WIDTH - radius;
		}
		if (this.y - radius < 0) {
			this.y = radius;
		} else if (this.y + radius > MAX_HEIGHT) {
			this.y = MAX_HEIGHT - radius;
		}
		this.checkStainCollisionFromCenter(stains, grid);
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

	checkStainCollisionFromCenter(stains, grid) {
		const nearbyStains = grid.getNearbyEntities(this);
		for (let i = nearbyStains.length - 1; i >= 0; i--) {
			const stain = nearbyStains[i];
			const dx = stain.x - this.x;
			const dy = stain.y - this.y;
			const distanceSquared = dx * dx + dy * dy;
			const radiusSum = this.radius + stain.radius;

			// verifie si la distance au carré est inférieure au carré de la somme des rayons
			if (distanceSquared <= radiusSum * radiusSum) {
				// Supprime le stain et applique les effets
				const index = stains.getAll().indexOf(stain);
				if (index !== -1) {
					stains.splice(index, 1);
					this.grow();
				}
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
}
