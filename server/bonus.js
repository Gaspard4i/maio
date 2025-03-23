import { Stain } from './stain.js';

export class Bonus extends Stain {
	constructor(radius, x, y) {
		const bonusType =
			Math.random() < 0.5 ? BonusType.VITESSE : BonusType.TAILLE;
		super(radius + 50, x, y);
		this.type = bonusType;
	}
}

export const BonusType = {
	VITESSE: 'VITESSE',
	TAILLE: 'TAILLE',
};
