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
import { updateProgressBar } from './progressBar.js';

const DEBUG = false;

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
			// Update progress bar with current player score
			updateProgressBar(currentPlayer.score || 0);
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

socket.on('playerDisconnected', id => {
	delete otherPlayers[id];
});

socket.on('lost', () => {
	const lostMessage = document.getElementById('lost-message');
	const startScreen = document.getElementById('start-screen');
	const canvas = document.querySelector('.gameCanvas');
	const score = document.querySelector('.score');

	startScreen.style.display = ''; // Cache l'écran de démarrage
	canvas.classList.add('background'); // Retire la classe d'arrière-plan
	score.classList.add('hidden'); // Affiche la zone de score
	lostMessage.classList.remove('hidden'); // Show the message
});

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

		startScreen.classList.add('hidden');
		canvas.classList.remove('background');
		score.classList.remove('hidden');

		socket.emit('joinGame');
	});

	// autres boutons
	document.getElementById('credits-button').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.getElementById('start-screen');
		const creditsScreen = document.getElementById('credits-screen');
		startScreen.classList.add('hidden');
		creditsScreen.classList.remove('hidden');
	});

	document.getElementById('score-button').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.getElementById('start-screen');
		const scoreScreen = document.getElementById('score-screen');
		startScreen.classList.add('hidden'); // Cache l'écran de démarrage
		scoreScreen.classList.remove('hidden');
	});

	// Nouveaux boutons pour About et Contact
	document.getElementById('about-button').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.getElementById('start-screen');
		const aboutScreen = document.getElementById('about-screen');
		startScreen.classList.add('hidden');
		aboutScreen.classList.remove('hidden');
	});

	document.getElementById('contact-button').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.getElementById('start-screen');
		const contactScreen = document.getElementById('contact-screen');
		startScreen.classList.add('hidden');
		contactScreen.classList.remove('hidden');
	});

	// Back buttons
	document.getElementById('credits-back').addEventListener('click', () => {
		const startScreen = document.getElementById('start-screen');
		const creditsScreen = document.getElementById('credits-screen');
		startScreen.style.display = ''; // Montre l'écran de démarrage
		creditsScreen.classList.add('hidden');
	});

	document.getElementById('score-back').addEventListener('click', () => {
		const startScreen = document.getElementById('start-screen');
		const scoreScreen = document.getElementById('score-screen');
		startScreen.style.display = ''; // Montre l'écran de démarrage
		scoreScreen.classList.add('hidden');
	});

	// Nouveaux boutons de retour
	document.getElementById('about-back').addEventListener('click', () => {
		const startScreen = document.getElementById('start-screen');
		const aboutScreen = document.getElementById('about-screen');
		startScreen.style.display = ''; // Montre l'écran de démarrage
		aboutScreen.classList.add('hidden');
	});

	document.getElementById('contact-back').addEventListener('click', () => {
		const startScreen = document.getElementById('start-screen');
		const contactScreen = document.getElementById('contact-screen');
		startScreen.style.display = ''; // Montre l'écran de démarrage
		contactScreen.classList.add('hidden');
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
