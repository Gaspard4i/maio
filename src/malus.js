import { Entity } from './entity.js';

export class Malus extends Entity {
	constructor(radius, x, y, vx, vy) {
		super(radius, x, y, vx, vy);
		this.color = 'rgba(255, 0, 0, 0.5)';
	}

	draw(context) {
		context.fillStyle = this.color;
		context.strokeStyle = this.color;
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		context.fill();
		context.stroke();
	}
}
