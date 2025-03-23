import { Stain } from './stain.js';
import { Bonus } from './bonus.js';
import {
	MAX_WIDTH,
	MAX_HEIGHT,
	BONUS_STAIN_CHANCE,
	STAIN_SIZE,
	BONUS_SIZE,
} from './config.js';

export class Stains {
	constructor(count) {
		this.stains = [];
		this.count = count;
		this.initializeStains();
	}

	initializeStains() {
		this.stains = []; // reset tâches
		this.createStains(this.count);
	}

	createStains(count) {
		for (let i = 0; i < count; i++) {
			const x = Math.floor(Math.random() * MAX_WIDTH - 10);
			const y = Math.floor(Math.random() * MAX_HEIGHT - 10);
			const stain =
				Math.random() < BONUS_STAIN_CHANCE
					? new Bonus(BONUS_SIZE, x, y)
					: new Stain(STAIN_SIZE, x, y);
			this.stains.push(stain);
		}
	}

	updateStains(players) {
		while (this.stains.length < this.count) {
			let stain;
			let isValidPosition = false;

			while (!isValidPosition) {
				const x = Math.random() * MAX_WIDTH;
				const y = Math.random() * MAX_HEIGHT;
				stain =
					Math.random() < BONUS_STAIN_CHANCE
						? new Bonus(BONUS_SIZE, x, y)
						: new Stain(STAIN_SIZE, x, y);

				isValidPosition = !Object.values(players).some(player => {
					const dx = player.x - stain.x;
					const dy = player.y - stain.y;
					const distanceSquared = dx * dx + dy * dy;
					const radiusSum = player.radius + stain.radius;
					return distanceSquared < radiusSum * radiusSum;
				});
			}

			this.stains.push(stain);
		}
	}

	size() {
		return this.stains.length;
	}

	get(i) {
		return this.stains[i];
	}

	splice(i, val) {
		this.stains.splice(i, val);
	}

	push(stain) {
		this.stains.push(stain);
	}

	getAll() {
		return this.stains;
	}
}
