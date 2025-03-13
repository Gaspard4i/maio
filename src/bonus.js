import { Stain } from './stain.js';

export class Bonus extends Stain {
	constructor(radius, x, y) {
		const bonus = Math.random() < 0.5 ? BonusType.VITESSE : BonusType.TAILLE;
		super(radius+50, x, y);
		this.image.src =
			bonus === BonusType.VITESSE
				? 'src/assets/stain.png'
				: 'src/assets/stain.png';
		this.bonus = bonus;
	}
}

export const BonusType = {
	VITESSE: 'VITESSE',
	TAILLE: 'TAILLE',
};
