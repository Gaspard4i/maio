import { Bonus, BonusType } from '../src/bonus.js';

describe('Bonus', () => {
	test('should create a Bonus instance with correct properties', () => {
		const radius = 10;
		const x = 100;
		const y = 200;
		const bonus = new Bonus(radius, x, y);

		expect(bonus).toBeInstanceOf(Bonus);
		expect(bonus.radius).toBe(radius + 50);
		expect(bonus.x).toBe(x);
		expect(bonus.y).toBe(y);
		expect([BonusType.VITESSE, BonusType.TAILLE]).toContain(bonus.bonus);
		expect(['src/assets/stainGreen.png', 'src/assets/stainBlue.png']).toContain(
			bonus.image.src
		);
	});
});
