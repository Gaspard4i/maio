import { canvas, context, observeCanvas } from './canvas.js';
import {
	movePlayer,
	handleKeyDown,
	handleKeyUp,
	drawPlayer,
} from './player.js';
import { stains, createNewStains } from './entities.js';
import { camera } from './camera.js';
import { player } from './player.js';

function draw() {
    context.save();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    context.translate(centerX, centerY);
    context.scale(camera.zoom, camera.zoom);
    context.translate(-player.x, -player.y);
	drawPlayer(context);
    createNewStains();
    stains.forEach(entity => entity.draw(context));
    
    context.restore();
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
