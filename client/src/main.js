import { canvas, context, observeCanvas } from './canvas.js';
import { io } from 'socket.io-client';
import { drawPlayer } from './playerDraw.js';
import { handleKeyDown, handleKeyUp } from './input.js';
//camera
//player
//stains, createNewStains

const socket = io(window.location.hostname + ':8080');

socket.on('log', () => {
	console.log('logged');
});

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

// Empêcher le zoom avec la molette et les raccourcis clavier
document.addEventListener(
	'wheel',
	function (e) {
		if (e.ctrlKey) {
			e.preventDefault();
		}
	},
	{ passive: false }
);

// Empêcher le zoom par pincement sur les appareils tactiles
document.addEventListener(
	'touchstart',
	function (e) {
		if (e.touches.length > 1) {
			e.preventDefault();
		}
	},
	{ passive: false }
);

document.addEventListener(
	'touchmove',
	function (e) {
		if (e.touches.length > 1) {
			e.preventDefault();
		}
	},
	{ passive: false }
);

// Empêcher les gestes tactiles spécifiques (iOS Safari)
document.addEventListener('gesturestart', function (e) {
	e.preventDefault();
});
document.addEventListener('gesturechange', function (e) {
	e.preventDefault();
});
document.addEventListener('gestureend', function (e) {
	e.preventDefault();
});
