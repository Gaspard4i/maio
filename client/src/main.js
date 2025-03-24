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
	const gameOverScreen = document.querySelector('.game-over-screen');
	const startScreen = document.querySelector('.start-screen');
	const canvas = document.querySelector('.gameCanvas');
	const score = document.querySelector('.score');

	startScreen.classList.remove('hidden'); // Cache l'écran de démarrage
	canvas.classList.add('background'); // Retire la classe d'arrière-plan
	score.classList.add('hidden'); // Affiche la zone de score
	gameOverScreen.classList.remove('hidden'); // Show the message
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
    // Empêcher le comportement par défaut des touches, qu'on soit dans le jeu ou non
    document.addEventListener('keydown', event => {
		event.preventDefault();
        if (!canvas.classList.contains('background')) {
			// Uniquement pendant le jeu, passer l'événement à handleKeyUp
            handleKeyDown(event);
        }
    });
    
    document.addEventListener('keyup', event => {
		event.preventDefault();
        if (!canvas.classList.contains('background')) {
            // Uniquement pendant le jeu, passer l'événement à handleKeyUp
            handleKeyUp(event);
        }
    });
    
    preventZoom();
}

setDebugCameraMode(DEBUG);
setDebugPlayerMode(DEBUG);
setDebugEntityMode(DEBUG);
setDebugGridMode(DEBUG);

function startGame() {
	const startScreen = document.querySelector('#start-screen');
	const canvas = document.querySelector('.gameCanvas');
	const score = document.querySelector('.score');
	startScreen.classList.add('hidden');
	canvas.classList.remove('background');
	score.classList.remove('hidden');
	socket.emit('joinGame');
}

// Gestion du bouton pour démarrer le jeu
function setupStartButton() {
	document.querySelector('#start-game').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const canvas = document.querySelector('.gameCanvas');
		const score = document.querySelector('.score');

		startScreen.classList.add('hidden');
		canvas.classList.remove('background');
		score.classList.remove('hidden');

		socket.emit('joinGame');
	});

	// autres boutons
	document.querySelector('#credits-button').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const creditsScreen = document.querySelector('.credits-screen');
		startScreen.classList.add('hidden');
		creditsScreen.classList.remove('hidden');
	});

	document.querySelector('#score-button').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const scoreScreen = document.querySelector('.score-screen');
		startScreen.classList.add('hidden'); // Cache l'écran de démarrage
		scoreScreen.classList.remove('hidden');
	});

	// Nouveaux boutons pour About et Contact
	document.querySelector('#about-button').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const aboutScreen = document.querySelector('.about-screen');
		startScreen.classList.add('hidden');
		aboutScreen.classList.remove('hidden');
	});

	document.querySelector('#contact-button').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const contactScreen = document.querySelector('.contact-screen');
		startScreen.classList.add('hidden');
		contactScreen.classList.remove('hidden');
	});

	// Back buttons
	document.querySelector('#credits-back').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const creditsScreen = document.querySelector('.credits-screen');
		startScreen.classList.remove('hidden'); // Montre l'écran de démarrage
		creditsScreen.classList.add('hidden');
	});

	document.querySelector('#score-back').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const scoreScreen = document.querySelector('.score-screen');
		startScreen.classList.remove('hidden'); // Montre l'écran de démarrage
		scoreScreen.classList.add('hidden');
	});

	// Nouveaux boutons de retour
	document.querySelector('#about-back').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const aboutScreen = document.querySelector('.about-screen');
		startScreen.classList.remove('hidden'); // Montre l'écran de démarrage
		aboutScreen.classList.add('hidden');
	});

	document.querySelector('#contact-back').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const contactScreen = document.querySelector('.contact-screen');
		startScreen.classList.remove('hidden'); // Montre l'écran de démarrage
		contactScreen.classList.add('hidden');
	});

	document.querySelector('#back-to-home').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const gameOverScreen = document.querySelector('.game-over-screen');
		startScreen.classList.remove('hidden');; // Montre l'écran de démarrage
		gameOverScreen.classList.add('hidden');
	});

	document.querySelector('#restart-game').addEventListener('click', event => {
		event.preventDefault();
		const gameOverScreen = document.querySelector('.game-over-screen');
		gameOverScreen.classList.add('hidden');
		startGame();
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
