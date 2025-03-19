import { Entity } from '../server/entity.js';

export class Stain extends Entity {
	constructor(radius, x, y) {
		super(radius, x, y);
		this.image = new Image();
		this.image.src = '../../src/assets/stain.png';
	}

	draw(context) {
		context.drawImage(
			this.image,
			this.x - this.radius,
			this.y - this.radius,
			this.radius * 2,
			this.radius * 2
		);
	}
}
