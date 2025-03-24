import { canvas, context, observeCanvas, drawGame } from './canvas.js';
import { io } from 'socket.io-client';
import { Camera } from './camera.js';
import {
	handleKeyDown,
	handleKeyUp,
	preventZoom,
	setCurrentControlMode,
} from './input.js';
import { updateProgressBar } from './progressBar.js';
import {
	setDebugCameraMode,
	setDebugPlayerMode,
	setDebugEntityMode,
	setDebugGridMode,
} from './debug.js';
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
	gameOverScreen.classList.remove('hidden'); // Show the message
});

// Variables pour le calcul des FPS
let fpsCounter = 0;
let lastFpsUpdate = 0;
let currentFps = 0;
let fpsDisplayEnabled = false;

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

	// FPS
	fpsCounter++;
	const now = performance.now();
	if (now - lastFpsUpdate >= 1000) {
		currentFps = Math.round((fpsCounter * 1000) / (now - lastFpsUpdate));
		fpsCounter = 0;
		lastFpsUpdate = now;

		if (fpsDisplayEnabled) {
			const fpsDisplay = document.getElementById('fps-counter');
			fpsDisplay.textContent = `${currentFps} FPS`;
		}
	}

	requestAnimationFrame(render);
}

// event globaux
function setupGlobalEvents() {
	// empeche d'utiliser le clavier sauf si on est dans une zone de texte
	document.addEventListener('keydown', event => {
		const activeElement = document.activeElement;
		if (activeElement && activeElement.tagName === 'INPUT') return;
		if (!canvas.classList.contains('background')) {
			handleKeyDown(event);
		}
	});

	document.addEventListener('keyup', event => {
		const activeElement = document.activeElement;
		if (activeElement && activeElement.tagName === 'INPUT') return;
		if (!canvas.classList.contains('background')) {
			handleKeyUp(event);
		}
	});

	preventZoom();
}

// menu option
function setupSettingsButton() {
	// ouvre le menu
	const settingsIcon = document.querySelector(
		'.menu-options img[alt="Réglages"]'
	);
	const settingsPanel = document.getElementById('settings-panel');
	const closeSettingsButton = document.getElementById('close-settings');

	settingsIcon.addEventListener('click', () => {
		settingsPanel.classList.remove('hidden');
	});

	closeSettingsButton.addEventListener('click', () => {
		settingsPanel.classList.add('hidden');
	});

	// femeture du menu si on clique à coté
	document.addEventListener('mousedown', event => {
		if (
			!settingsPanel.classList.contains('hidden') &&
			!settingsPanel.contains(event.target) &&
			event.target !== settingsIcon
		) {
			settingsPanel.classList.add('hidden');
		}
	});

	// toggle clavier/souris
	const controlToggle = document.getElementById('control-toggle');
	const keyboardInfo = document.querySelector('.keyboard-info');
	const mouseInfo = document.querySelector('.mouse-info');

	controlToggle.addEventListener('change', () => {
		if (controlToggle.checked) {
			// souris
			keyboardInfo.classList.add('hidden');
			mouseInfo.classList.remove('hidden');
			setControlMode('mouse');
		} else {
			// clavier
			mouseInfo.classList.add('hidden');
			keyboardInfo.classList.remove('hidden');
			setControlMode('keyboard');
		}
	});

	// affichage FPS
	const fpsToggle = document.getElementById('fps-toggle');
	const fpsCounter = document.getElementById('fps-counter');

	fpsToggle.addEventListener('change', () => {
		if (fpsToggle.checked) {
			// active l'affichage
			fpsCounter.classList.remove('hidden');
			fpsDisplayEnabled = true;
		} else {
			// désactive
			fpsCounter.classList.add('hidden');
			fpsDisplayEnabled = false;
		}

		// save la pref
		localStorage.setItem('fpsDisplay', fpsToggle.checked);
	});

	// init les fps en fonction de la pref save
	const savedFpsDisplay = localStorage.getItem('fpsDisplay') === 'true';
	fpsToggle.checked = savedFpsDisplay;
	fpsDisplayEnabled = savedFpsDisplay;
	if (savedFpsDisplay) {
		fpsCounter.classList.remove('hidden');
	} else {
		fpsCounter.classList.add('hidden');
	}
}

function setControlMode(mode) {
	localStorage.setItem('controlMode', mode);
	setCurrentControlMode(mode);

	if (mode === 'mouse') {
		// console.log('Mode souris activé');
	} else {
		// console.log('Mode clavier activé');
	}
}

function initControlMode() {
	const savedMode = localStorage.getItem('controlMode') || 'keyboard';
	const controlToggle = document.getElementById('control-toggle');

	if (savedMode === 'mouse') {
		controlToggle.checked = true;
		document.querySelector('.keyboard-info').classList.add('hidden');
		document.querySelector('.mouse-info').classList.remove('hidden');
	} else {
		controlToggle.checked = false;
		document.querySelector('.mouse-info').classList.add('hidden');
		document.querySelector('.keyboard-info').classList.remove('hidden');
	}

	setControlMode(savedMode);
}

setDebugCameraMode(DEBUG);
setDebugPlayerMode(DEBUG);
setDebugEntityMode(DEBUG);
setDebugGridMode(DEBUG);

function startGame() {
	const startScreen = document.querySelector('#start-screen');
	const canvas = document.querySelector('.gameCanvas');
	const score = document.querySelector('.score');
	const pseudoInput = document.querySelector('#player-pseudo');
	const pseudo = pseudoInput.value.trim() || 'Joueur';

	startScreen.classList.add('hidden');
	canvas.classList.remove('background');
	score.classList.remove('hidden');
	socket.emit('joinGame', { pseudo: pseudo, startTime: Date.now() }); // Envoi du pseudo au serveur
}

// demmare le jeu
function setupStartButton() {
	document.querySelector('#start-game').addEventListener('click', event => {
		event.preventDefault();
		startGame();
	});

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
		startScreen.classList.add('hidden');
		scoreScreen.classList.remove('hidden');
	});

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

	document.querySelector('#credits-back').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const creditsScreen = document.querySelector('.credits-screen');
		startScreen.classList.remove('hidden');
		creditsScreen.classList.add('hidden');
	});

	document.querySelector('#score-back').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const scoreScreen = document.querySelector('.score-screen');
		startScreen.classList.remove('hidden');
		scoreScreen.classList.add('hidden');
	});

	document.querySelector('#about-back').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const aboutScreen = document.querySelector('.about-screen');
		startScreen.classList.remove('hidden');
		aboutScreen.classList.add('hidden');
	});

	document.querySelector('#contact-back').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const contactScreen = document.querySelector('.contact-screen');
		startScreen.classList.remove('hidden');
		contactScreen.classList.add('hidden');
	});

	document.querySelector('#back-to-home').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const gameOverScreen = document.querySelector('.game-over-screen');
		startScreen.classList.remove('hidden');
		gameOverScreen.classList.add('hidden');
	});

	document.querySelector('#restart-game').addEventListener('click', event => {
		event.preventDefault();
		const gameOverScreen = document.querySelector('.game-over-screen');
		gameOverScreen.classList.add('hidden');
		startGame();
	});
}

// init principale
function init() {
	setupSocketEvents();
	setupGlobalEvents();
	setupStartButton();
	setupSettingsButton();

	// init le mode de contrôle
	document.addEventListener('DOMContentLoaded', () => {
		initControlMode();
	});

	observeCanvas(() => {}, render);
}

init();
