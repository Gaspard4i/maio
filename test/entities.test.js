import { stains, createNewStains } from '../src/entities.js';
import { Stain } from '../src/stain.js';
import { Bonus } from '../src/bonus.js';

describe('Entities Module', () => {
	beforeEach(() => {
		stains.length = 0; 
	});

	test('should create 1000 stains initially', () => {
		expect(stains.length).toBe(1000);
		stains.forEach(entity => {
			expect(entity).toBeInstanceOf(Stain);
		});
	});

	test('should create new stains when stains array is less than 1000', () => {
		stains.length = 900; 
		createNewStains();
		expect(stains.length).toBe(1000);
	});

	test('should create Bonus entities with a probability of 0.1', () => {
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
		expect(bonusCount).toBeGreaterThan(0);
		expect(bonusCount).toBeLessThan(200); 
	});
});
