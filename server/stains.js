import { Stain } from './stain.js';
import { Bonus } from './bonus.js';
import { maxWidth, maxHeight } from './constants.js';

export class Stains {
	constructor(count) {
		this.stains = [];
		this.createStains(count);
	}

	createStains(count) {
		for (let i = 0; i < count; i++) {
			const x = Math.floor(Math.random() * maxWidth - 10);
			const y = Math.floor(Math.random() * maxHeight - 10);
			const entity =
				Math.random() < 0.1 ? new Bonus(20, x, y) : new Stain(20, x, y);
			this.stains.push(entity);
		}
	}

	updateStains() {
		while (this.stains.length < 1000) {
			const x = Math.floor(Math.random() * maxWidth - 10);
			const y = Math.floor(Math.random() * maxHeight - 10);
			const entity =
				Math.random() < 0.1 ? new Bonus(20, x, y) : new Stain(20, x, y);
			this.stains.push(entity);
		}
	}
}
