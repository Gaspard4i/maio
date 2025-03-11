import { Entity } from './entity.js';

export class Stain extends Entity {
	constructor(radius, x, y, vx, vy) {
		super(radius, x, y, vx, vy);
		this.image = new Image();
		this.image.src = 'src/assets/stain.png';
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
