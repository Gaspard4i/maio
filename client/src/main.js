import { canvas, context, observeCanvas, drawGame } from './canvas.js';
import { io } from 'socket.io-client';
import { Camera } from './camera.js'; // Import de la caméra
//camera
//player
//stains, createNewStains

const socket = io(window.location.hostname + ':8080');

const stains = []; // Liste des entités (taches et bonus)

// Initialisation du joueur local
const currentPlayer = {
	x: 100,
	y: 100,
	vx: 0,
	vy: 0,
	radius: 30,
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
			Object.assign(currentPlayer, players[id]);
		} else {
			otherPlayers[id] = players[id];
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

// Envoi des données du joueur local au serveur
function sendPlayerData(update) {
	// Applique les mises à jour au joueur local
	Object.assign(currentPlayer, update);

	// Envoie les données mises à jour au serveur
	socket.emit('updatePlayer', {
		id: currentPlayer.id,
		x: currentPlayer.x,
		y: currentPlayer.y,
		vx: currentPlayer.vx,
		vy: currentPlayer.vy,
		radius: currentPlayer.radius,
	});
}

function render() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	// console.log(currentPlayer);
	camera.adjustCameraPosition(currentPlayer, canvas.width, canvas.height);
	drawGame(context, currentPlayer, otherPlayers, stains, camera); // Ajout de camera
	requestAnimationFrame(render);
}

observeCanvas(() => {}, render);
