import { canvas, context, observeCanvas, drawGame } from './canvas.js';
import { io } from 'socket.io-client';
import { Camera } from './camera.js'; // Import de la caméra
//camera
//player
//stains, createNewStains

const socket = io(window.location.hostname + ':8080');

const stains = []; // Liste des entités (taches et bonus)

// Initialisation du joueur local
const player = {
	id: null,
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
	player.id = socket.id;
	console.log(`Connecté au serveur avec l'ID :`, player.id);
});

socket.on('updatePlayers', players => {
	// Met à jour les autres joueurs et le joueur local
	for (const id in players) {
		if (id === player.id) {
			Object.assign(player, players[id]); // Met à jour les données du joueur local
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
function sendPlayerData() {
	socket.emit('updatePlayer', {
		id: player.id,
		x: player.x,
		y: player.y,
		vx: player.vx,
		vy: player.vy,
		radius: player.radius,
	});
}

function render() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	camera.adjustCameraPosition(player, canvas.width, canvas.height);
	drawGame(context, player, otherPlayers, stains, camera);
	requestAnimationFrame(render);
}

observeCanvas(() => {}, render);
