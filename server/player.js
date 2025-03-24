import { Entity } from './entity.js';
import { BonusType } from './bonus.js';
import { v4 as uuidv4 } from 'uuid';
import {
	BASE_PLAYER_SPEED,
	ACCELERATED_SPEED,
	MAX_WIDTH,
	MAX_HEIGHT,
	EAT_THRESHOLD,
	ABSORB_AREA_THRESHOLD,
	INVINCIBILITY_TIME,
	PLAYER_EAT_BONUS,
	STAIN_SCORE,
	BONUS_SPEED_MULTIPLIER,
	BONUS_SIZE_MULTIPLIER,
} from './config.js';

///////////////////CLASSE PLAYER///////////////////
export class Player extends Entity {
	constructor(id, radius, x, y, vx, vy, pseudo = undefined) {
		super(radius, x, y);
		this.id = id;
		this.vx = vx;
		this.vy = vy;
		this.speed = BASE_PLAYER_SPEED;
		this.keys = {};
		this.isAccelerating = false;
		this.isSliding = false;
		this.score = 0;
		this.pseudo = pseudo;
		this.isInvincible = true;
		setTimeout(() => {
			this.isInvincible = false;
		}, INVINCIBILITY_TIME);
	}

	movePlayer(stains, grid, players, io) {
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
		this.checkPlayerCollision(grid, players, io);
	}

	canEat(otherPlayer) {
		if (this.radius < otherPlayer.radius * EAT_THRESHOLD) return false;
		const dx = this.x - otherPlayer.x;
		const dy = this.y - otherPlayer.y;
		const distanceSquared = dx * dx + dy * dy;
		const distance = Math.sqrt(distanceSquared);

		if (distance >= this.radius + otherPlayer.radius) return false;

		const r1 = this.radius;
		const r2 = otherPlayer.radius;

		const intersectionArea =
			r1 *
				r1 *
				Math.acos((distanceSquared + r1 * r1 - r2 * r2) / (2 * distance * r1)) +
			r2 *
				r2 *
				Math.acos((distanceSquared + r2 * r2 - r1 * r1) / (2 * distance * r2)) -
			0.5 *
				Math.sqrt(
					(-distance + r1 + r2) *
						(distance + r1 - r2) *
						(distance - r1 + r2) *
						(distance + r1 + r2)
				);

		const otherPlayerArea = Math.PI * r2 * r2;
		return intersectionArea >= ABSORB_AREA_THRESHOLD * otherPlayerArea;
	}

	absorb(otherPlayer) {
		this.radius += otherPlayer.radius /*/ 2*/;
		this.score += otherPlayer.score + PLAYER_EAT_BONUS;
		this.updateSpeed();
	}

	checkPlayerCollision(grid, players, io) {
		const nearbyPlayers = grid.getNearbyEntities(this);
		for (const otherPlayer of nearbyPlayers) {
			if (
				otherPlayer !== this &&
				players[otherPlayer.id] &&
				this.canEat(otherPlayer) &&
				!this.isInvincible &&
				!otherPlayer.isInvincible
			) {
				console.log(
					`${this.id} a mangé ${otherPlayer.id} (${otherPlayer.pseudo})`
				);
				this.absorb(otherPlayer); // miam miam

				// looser go back to moodle
				if (!otherPlayer.isBot) {
					io.to(otherPlayer.id).emit('redirect', '/'); // Redirige vers la page principale
				}

				delete players[otherPlayer.id];
			}
		}
	}

	updateMouseMovement(dx, dy, canvaWidth, canvasHeight) {
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
		this.speed = (BASE_PLAYER_SPEED / this.radius) * 40;
		// console.log(this.speed);
	}

	grow() {
		this.score += STAIN_SCORE;
		this.radius += Math.sqrt(STAIN_SCORE / 100);
		// console.log('Score = ' + this.score);
		this.updateSpeed();
	}

	bonus(bt) {
		if (bt === BonusType.VITESSE) {
			this.speed *= BONUS_SPEED_MULTIPLIER;
			setTimeout(() => {
				this.speed /= BONUS_SPEED_MULTIPLIER;
			}, INVINCIBILITY_TIME);
		} else if (bt === BonusType.TAILLE) {
			this.radius *= BONUS_SIZE_MULTIPLIER;
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
				// mange et grossit
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
		const speed = this.isAccelerating
			? ACCELERATED_SPEED * this.speed
			: this.speed;
		this.vx = dx * speed;
		this.vy = dy * speed;
		this.isSliding = false;
	}
}

export class BotPlayer extends Player {
	constructor(radius, x, y, vx, vy) {
		const id = uuidv4(); // uuid pour les bots
		super(`bot_${id}`, radius, x, y, vx, vy, false, 'Bot');
		this.isBot = true;
	}

	updateBotMovement(grid, stains, players, io) {
		// direction aléatoire
		if (Math.random() < 0.02) {
			this.vx = Math.random() * 4 - 2;
			this.vy = Math.random() * 4 - 2;
		}

		// mouvement
		this.x += this.vx;
		this.y += this.vy;

		// collisions
		// console.log('Bot collision');
		this.movePlayer(stains, grid, players, io); // Passe io ici
		this.checkPlayerCollision(grid, players, io); // Ajout pour permettre aux bots de manger
	}
}
