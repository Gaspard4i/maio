import { Stain } from '../src/stain.js';
import { Bonus } from '../src/bonus.js';
import { maxHeight, maxWidth } from '../../src/canvas.js';

export const stains = [];
for (let i = 0; i < 1000; i++) {
	const x = Math.floor(Math.random() * maxWidth - 10);
	const y = Math.floor(Math.random() * maxHeight - 10);
	const entity =
		Math.random() < 0.1 ? new Bonus(20, x, y) : new Stain(20, x, y);
	stains.push(entity);
}

export function createNewStains() {
	while (stains.length < 1000) {
		const x = Math.floor(Math.random() * maxWidth - 10);
		const y = Math.floor(Math.random() * maxHeight - 10);
		const entity =
			Math.random() < 0.1 ? new Bonus(20, x, y) : new Stain(20, x, y);
		stains.push(entity);
	}
}
