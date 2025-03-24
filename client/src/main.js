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

const DEBUG = true;

export const socket = io(window.location.hostname + ':8080');

const stains = [];
const currentPlayer = {};
export const camera = new Camera();
const otherPlayers = {};

// Gestion des événements socket
function setupSocketEvents() {
	socket.on('connect', () => {
		console.log(`Connecté au serveur avec l'ID :`, socket.id);
	});

	socket.on('updatePlayers', players => updatePlayers(players));
	socket.on('updateStains', serverStains => updateStains(serverStains));
	socket.on('playerDisconnected', id => delete otherPlayers[id]);
	socket.on('redirect', url => (window.location.href = url));
	socket.on('reload', () => {
		console.log('Serveur a détecté un problème, rechargement de la page...');
		window.location.reload();
	});
}

// Met à jour les joueurs
function updatePlayers(players) {
	for (const id in otherPlayers) {
		if (!players[id]) {
			delete otherPlayers[id];
		}
	}
	for (const id in players) {
		if (id === socket.id) {
			Object.assign(currentPlayer, players[id]);
		} else {
			otherPlayers[id] = players[id];
		}
	}
}

// Met à jour les taches
function updateStains(serverStains) {
	if (serverStains && Array.isArray(serverStains.stains)) {
		stains.length = 0;
		stains.push(...serverStains.stains);
	} else {
		console.error(
			'Les données reçues pour les taches ne sont pas valides :',
			serverStains
		);
	}
}

// Gestion du rendu
function render() {
	context.clearRect(0, 0, canvas.width, canvas.height);

	if (canvas.classList.contains('background')) {
		// Mode background : ne pas afficher le joueur local
		camera.x = 6000;
		camera.y = 2500;
		camera.zoom = Math.min(canvas.width / 12000, canvas.height / 5000) * 5; // Zoom un peu plus
		drawGame(context, {}, otherPlayers, stains, [], camera);
	} else {
		// Mode normal : afficher le joueur local
		camera.adjustCameraPosition(currentPlayer, canvas.width, canvas.height);
		camera.zoom *= 1.1; // Zoom un peu plus
		drawGame(context, currentPlayer, otherPlayers, stains, [], camera);
	}

	requestAnimationFrame(render);
}

// Initialisation des événements globaux
function setupGlobalEvents() {
	window.addEventListener('keydown', event => handleKeyDown(event));
	window.addEventListener('keyup', event => handleKeyUp(event));
	preventZoom();
}

setDebugCameraMode(DEBUG);
setDebugPlayerMode(DEBUG);
setDebugEntityMode(DEBUG);
setDebugGridMode(DEBUG);

// Gestion du bouton pour démarrer le jeu
function setupStartButton() {
	document.getElementById('start-game').addEventListener('click', () => {
		const startScreen = document.getElementById('start-screen');
		const canvas = document.querySelector('.gameCanvas');
		const score = document.querySelector('.score');

		startScreen.style.display = 'none';
		canvas.classList.remove('background');
		score.classList.remove('hidden');

		socket.emit('joinGame');
	});
}

// Initialisation principale
function init() {
	setupSocketEvents();
	setupGlobalEvents();
	setupStartButton();
	observeCanvas(() => {}, render);
}

init();
