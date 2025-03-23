import { Stain } from './stain.js';
import { Bonus } from './bonus.js';
import { MAX_WIDTH, MAX_HEIGHT } from './constants.js';

export class Stains {
	constructor(count) {
		this.stains = [];
		this.count = count;
		this.initializeStains();
	}

	initializeStains() {
		this.stains = []; // Réinitialise la liste des taches
		this.createStains(this.count); // Crée le nombre de taches spécifié
	}

	createStains(count) {
		for (let i = 0; i < count; i++) {
			const x = Math.floor(Math.random() * MAX_WIDTH - 10);
			const y = Math.floor(Math.random() * MAX_HEIGHT - 10);
			const stain =
				Math.random() < 0.1 ? new Bonus(20, x, y) : new Stain(20, x, y);
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
				stain = Math.random() < 0.1 ? new Bonus(20, x, y) : new Stain(20, x, y);

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
