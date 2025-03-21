import { canvas, context, observeCanvas, drawGame } from './canvas.js';
import { io } from 'socket.io-client';
import { Camera } from './camera.js'; // Import de la caméra
import { handleKeyDown, handleKeyUp } from './input.js';
//camera
//player
//stains, createNewStains

export const socket = io(window.location.hostname + ':8080');

const stains = []; // Liste des entités (taches et bonus)

// Initialisation du joueur local
const currentPlayer = {
	radius: 30,
	x: 100,
	y: 100,
	vx: 0,
	vy: 0,
	keys: {},
	useKeyboard: true,
};

const camera = new Camera();

// Liste des autres joueurs
const otherPlayers = {};

// Gestion des événements socket
socket.on('connect', () => {
	console.log(`Connecté au serveur avec l'ID :`, socket.id);
});

socket.on('updatePlayers', players => {
	// Réinitialise les autres joueurs
	for (const id in otherPlayers) {
		if (!players[id]) {
			delete otherPlayers[id];
		}
	}

	// Met à jour les joueurs existants ou en ajoute de nouveaux
	for (const id in players) {
		if (id === socket.id) {
			// console.log('players[id]');
			// console.log(players[id]);
			Object.assign(currentPlayer, players[id]);
			// console.log('currentPlayer');
			// console.log(currentPlayer);
		} else {
			otherPlayers[id] = { ...players[id], vx: 0, vy: 0 }; // Initialise la vitesse
		}
	}
});

socket.on('updateStains', serverStains => {
	// Vérifie si serverStains.stains est un tableau avant de le décomposer
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

socket.on('playerDisconnected', id => {
	delete otherPlayers[id];
});

function render() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	// console.log(currentPlayer);
	camera.adjustCameraPosition(currentPlayer, canvas.width, canvas.height);
	drawGame(context, currentPlayer, otherPlayers, stains, camera); // Ajout de camera
	requestAnimationFrame(render);
}

// Ajout des gestionnaires d'événements clavier
window.addEventListener('keydown', event => handleKeyDown(event));
window.addEventListener('keyup', event => handleKeyUp(event));

// Interdiction de zoomer sur la page
window.addEventListener(
	'wheel',
	event => {
		if (event.ctrlKey) {
			event.preventDefault();
		}
	},
	{ passive: false }
);

window.addEventListener('keydown', event => {
	if (
		event.ctrlKey &&
		(event.key === '+' ||
			event.key === '-' ||
			event.key === '0' ||
			event.key === '=')
	) {
		event.preventDefault();
	}
});

observeCanvas(() => {}, render);
