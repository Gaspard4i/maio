import { Bonus, BonusType } from '../server/stains/bonus.js';
import { describe, it } from 'node:test';
import assert from 'assert';

describe('Bonus', () => {
	it('should create a Bonus instance with correct properties', () => {
		const radius = 10;
		const x = 100;
		const y = 200;
		const bonus = new Bonus(radius, x, y);

		assert(bonus instanceof Bonus);
		assert.strictEqual(bonus.radius, radius + 50);
		assert.strictEqual(bonus.x, x);
		assert.strictEqual(bonus.y, y);
		assert([BonusType.VITESSE, BonusType.TAILLE].includes(bonus.bonus));
		assert(
			['src/assets/stainGreen.png', 'src/assets/stainBlue.png'].includes(
				bonus.image.src
			)
		);
	});
});
