import { canvas, context, observeCanvas } from './canvas.js';
import {
	movePlayer,
	handleKeyDown,
	handleKeyUp,
	drawPlayer,
} from './player.js';
import { stains, createNewStains } from './entities.js';

function draw() {
	drawPlayer(context);
	createNewStains();
	stains.forEach(entity => entity.draw(context));
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
