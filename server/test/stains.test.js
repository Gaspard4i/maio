import { describe, it } from 'node:test';
import { Stains } from '../stains.js';
import assert from 'node:assert/strict';
import { Stain } from '../stain.js';

describe('Stains module', () => {
	it('should return size of the tab stock in Stains', () => {
		const stains = new Stains(1000);
		assert.equal(stains.size(), 1000);
	});

	it('should return the correct stain when get it', () => {
		const stains = new Stains(10);
		const check = new Stain(69, 69, 69);
		stains.push(check);
		assert.deepEqual(check, stains.get(10));
	});
});
