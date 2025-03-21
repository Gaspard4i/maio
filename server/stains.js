import { Stain } from './stain.js';
import { Bonus } from './bonus.js';
import { maxWidth, maxHeight } from './constants.js';

export class Stains {
	constructor(count) {
		this.stains = [];
		this.count = count;
		this.createStains();
	}

	createStains() {
		for (let i = 0; i < this.count; i++) {
			const x = Math.floor(Math.random() * maxWidth - 10);
			const y = Math.floor(Math.random() * maxHeight - 10);
			const entity =
				Math.random() < 0.1 ? new Bonus(20, x, y) : new Stain(20, x, y);
			this.stains.push(entity);
		}
	}

	updateStains() {
		while (this.stains.length < this.count) {
			const x = Math.floor(Math.random() * maxWidth - 10);
			const y = Math.floor(Math.random() * maxHeight - 10);
			const entity =
				Math.random() < 0.1 ? new Bonus(20, x, y) : new Stain(20, x, y);
			this.stains.push(entity);
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
}
