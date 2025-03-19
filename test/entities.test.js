import { stains, createNewStains } from '../server/stains/entities.js';
import { Stain } from '../server/stains/stain.js';
import { Bonus } from '../server/stains/bonus.js';
import { describe, it } from 'node:test';
import assert from 'assert';

describe('Entities Module', () => {
	beforeEach(() => {
		stains.length = 0;
	});

	it('should create 1000 stains initially', () => {
		assert.strictEqual(stains.length, 1000);
		stains.forEach(entity => {
			assert(entity instanceof Stain);
		});
	});

	it('should create new stains when stains array is less than 1000', () => {
		stains.length = 900;
		createNewStains();
		assert.strictEqual(stains.length, 1000);
	});

	it('should create Bonus entities with a probability of 0.1', () => {
		let bonusCount = 0;
		for (let i = 0; i < 1000; i++) {
			const x = Math.floor(Math.random() * maxWidth - 10);
			const y = Math.floor(Math.random() * maxHeight - 10);
			const entity =
				Math.random() < 0.1 ? new Bonus(20, x, y) : new Stain(20, x, y);
			if (entity instanceof Bonus) {
				bonusCount++;
			}
		}
		assert(bonusCount > 0);
		assert(bonusCount < 200);
	});
});
