import {
	canvas,
	context,
	observeCanvas,
	drawGame,
	setDebugCameraMode,
	setDebugPlayerMode,
	setDebugEntityMode,
	setDebugGridMode,
} from './canvas.js';
import { io } from 'socket.io-client';
import { Camera } from './camera.js';
import { handleKeyDown, handleKeyUp, preventZoom } from './input.js';

export const socket = io(window.location.hostname + ':8080');

const stains = [];
const bots = [];
const currentPlayer = {
	radius: 30,
	x: 100,
	y: 100,
	vx: 0,
	vy: 0,
	keys: {},
	useKeyboard: true,
};
export const camera = new Camera();
const otherPlayers = {};

// événements socket
socket.on('connect', () => {
	console.log(`Connecté au serveur avec l'ID :`, socket.id);
});

socket.on('updatePlayers', players => {
	for (const id in otherPlayers) {
		if (!players[id]) {
			delete otherPlayers[id];
		}
	}
	for (const id in players) {
		if (id === socket.id) {
			Object.assign(currentPlayer, players[id]);
		} else {
			otherPlayers[id] = { ...players[id], vx: 0, vy: 0 };
		}
	}
});

socket.on('updateStains', serverStains => {
	if (serverStains && Array.isArray(serverStains.stains)) {
		stains.length = 0;
		stains.push(...serverStains.stains);
	} else {
		console.error(
			'Les données reçues pour les taches ne sont pas valides :',
			serverStains
		);
	}
});

socket.on('updateBots', serverBots => {
	if (serverBots && Array.isArray(serverBots.bots)) {
		bots.length = 0;
		bots.push(...serverBots.bots);
	} else {
		console.error(
			'Les données reçues pour les taches ne sont pas valides :',
			serverBots
		);
	}
});

socket.on('playerDisconnected', id => {
	delete otherPlayers[id];
});

function render() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	camera.adjustCameraPosition(currentPlayer, canvas.width, canvas.height);
	drawGame(context, currentPlayer, otherPlayers, stains, bots, camera);
	requestAnimationFrame(render);
}

window.addEventListener('keydown', event => handleKeyDown(event));
window.addEventListener('keyup', event => handleKeyUp(event));
preventZoom();

setDebugCameraMode(false);
setDebugPlayerMode(false);
setDebugEntityMode(false);
setDebugGridMode(false);

observeCanvas(() => {}, render);
