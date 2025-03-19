import { canvas, maxWidth, maxHeight } from './canvas.js';

///////////////////CONSTANTES///////////////////
const PLAYER_COLOR = 'rgba(255, 255, 255)';
const BASE_PLAYER_SPEED = 10;
const ACCELERATED_SPEED = 15;
const FRICTION = 0.9;

///////////////////CLASSE PLAYER///////////////////
export class PlayerDraw {
	constructor(player) {
		this.vx = player.vx;
		this.vy = player.vy;
		this.speed = player.speed;
		this.keys = player.keys;
		this.useKeyboard = player.useKeyboard;
		this.isAccelerating = player.isAccelerating;
		this.isSliding = player.isSliding;
	}

	///////////////////AFFICHAGE///////////////////
	draw(context) {
		context.fillStyle = PLAYER_COLOR;
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		context.fill();

		if (!this.useKeyboard) {
			context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
			context.lineWidth = 2;
			const maxDistance = Math.min(canvas.width, canvas.height) / 4;
			context.beginPath();
			context.arc(this.x, this.y, maxDistance, 0, 2 * Math.PI);
			context.stroke();
		}
	}

}

export function drawPlayer(context) {
	player.draw(context);
}
