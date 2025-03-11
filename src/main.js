import { canvas, context, observeCanvas } from './canvas.js';
import {
	movePlayer,
	handleKeyDown,
	handleKeyUp,
	drawPlayer,
} from './player.js';
import { Stain } from './stain.js';
import { Malus } from './malus.js';
import { Bonus } from './bonus.js';

const entities = [
	new Stain(20, 200, 200, 0, 0),
	new Stain(20, 600, 600, 0, 0),
	new Malus(20, 246, 478, 0, 0),
	new Malus(20, 234, 646, 0, 0),
	new Bonus(20, 987, 789, 0, 0),
];

function draw() {
	drawPlayer(context);
	entities.forEach(entity => entity.draw(context));
}

function render() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	draw();
	requestAnimationFrame(render);
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

setInterval(movePlayer, 1000 / 60);

observeCanvas(draw, render);
