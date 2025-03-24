import {
	canvas,
	context,
	observeCanvas,
	drawGame,
	drawPlayer,
} from './canvas.js';
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
let isPlayerDead = false;
let globalLeaderboard = [];

// Variable globale pour stocker le dessin personnalisé
let playerCustomDrawing = null;

// Gestion des événements socket
function setupSocketEvents() {
	socket.on('connect', () => {
		console.log(`Connecté au serveur avec l'ID :`, socket.id);
	});

	socket.on('updatePlayers', players => updatePlayers(players));
	socket.on('updateStains', serverStains => updateStains(serverStains));
	socket.on('playerDisconnected', id => delete otherPlayers[id]);
	socket.on('updateLeaderboard', newPB => updateLeaderboard(newPB));
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
			// Conserver le customDrawing s'il existe déjà dans currentPlayer
			const existingDrawing = currentPlayer.customDrawing;

			// Mettre à jour les propriétés du joueur
			Object.assign(currentPlayer, players[id]);

			// Restaurer le customDrawing si nécessaire
			if (existingDrawing && !currentPlayer.customDrawing) {
				currentPlayer.customDrawing = existingDrawing;
			}

			// Update progress bar with current player score
			updateProgressBar(currentPlayer.score || 0, globalLeaderboard);
		} else {
			// Pour les autres joueurs, conserver leur dessin personnalisé s'il existe
			const existingDrawing =
				otherPlayers[id] && otherPlayers[id].customDrawing;
			otherPlayers[id] = players[id];

			// Restaurer le dessin s'il existait précédemment mais n'est pas dans la mise à jour
			if (existingDrawing && !otherPlayers[id].customDrawing) {
				otherPlayers[id].customDrawing = existingDrawing;
			}
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

function updateLeaderboard(newLeaderboard) {
	// Convertir l'objet leaderboard en tableau
	const scores = Object.values(newLeaderboard);

	// Trier par score décroissant
	scores.sort((a, b) => b.score - a.score);

	// Stocker dans la variable globale
	globalLeaderboard = [...scores];

	// Mettre à jour le tableau principal des scores
	updateMainLeaderboard(scores);

	// Mettre à jour le mini leaderboard
	updateMiniLeaderboard(scores);
}

function updateMainLeaderboard(scores) {
	const leaderboardTable = document.querySelector('#score-screen table tbody');
	if (!leaderboardTable) return;

	// Vider le tableau
	leaderboardTable.innerHTML = '';

	// Ajouter tous les scores au tableau complet
	for (let i = 0; i < scores.length; i++) {
		const entry = scores[i];
		const row = document.createElement('tr');

		// Ajouter des classes pour les 3 premiers
		if (i === 0) row.classList.add('first');
		else if (i === 1) row.classList.add('second');
		else if (i === 2) row.classList.add('third');

		// Créer les cellules avec les données
		row.innerHTML = `
            <td>${entry.pseudo}</td>
            <td>${entry.score.toLocaleString()}</td>
            <td>${entry.date}</td>
        `;

		leaderboardTable.appendChild(row);
	}
}

function updateMiniLeaderboard(scores) {
	const miniLeaderboardTable = document.querySelector(
		'#mini-score-screen table tbody'
	);
	if (!miniLeaderboardTable) return;

	// Vider le tableau
	miniLeaderboardTable.innerHTML = '';

	// Ne prendre que les 3 meilleurs scores pour le mini-leaderboard
	const maxEntries = Math.min(scores.length, 3);

	// Si aucun score n'est disponible, afficher un message
	if (maxEntries === 0) {
		const row = document.createElement('tr');
		row.innerHTML = `
			<td colspan="2">Pas encore de scores</td>
		`;
		miniLeaderboardTable.appendChild(row);
		return;
	}

	for (let i = 0; i < maxEntries; i++) {
		const entry = scores[i];
		const row = document.createElement('tr');

		// Ajouter des classes pour les 3 premiers
		if (i === 0) row.classList.add('first');
		else if (i === 1) row.classList.add('second');
		else if (i === 2) row.classList.add('third');

		// Ajouter un emoji selon la position
		let positionEmoji = '';

		// Créer les cellules avec les données (sans la date)
		row.innerHTML = `
			<td>${entry.pseudo}</td>
			<td>${entry.score.toLocaleString()} pts</td>
		`;

		miniLeaderboardTable.appendChild(row);
	}
}

socket.on('playerDisconnected', id => {
	delete otherPlayers[id];
});

socket.on('lost', score => {
	const gameOverScreen = document.querySelector('.game-over-screen');
	updateProgressBar(score || 0, globalLeaderboard);
	gameOverScreen.classList.remove('hidden');
	isPlayerDead = true;
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
	} else if (!isPlayerDead) {
		camera.adjustCameraPosition(currentPlayer, canvas.width, canvas.height);
		camera.zoom *= 1.1; // Zoom un peu plus
		drawGame(context, currentPlayer, otherPlayers, stains, [], camera);
	} else {
		drawGame(context, {}, otherPlayers, stains, [], camera);
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
		if (!canvas.classList.contains('background') && event.key !== 'Escape') {
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

	// Écouteurs d'événements pour le bouton de personnalisation d'alien
	const customAlienButton = document.getElementById('custom-alien-button');

	// Gérer le click sur le bouton
	customAlienButton.addEventListener('click', event => {
		event.preventDefault();
		settingsPanel.classList.add('hidden');
		document.getElementById('custom-alien-screen').classList.remove('hidden');

		// Initialiser le canvas de prévisualisation
		initCustomAlienCanvas();
	});

	// Gérer le retour depuis l'écran de personnalisation
	document.getElementById('custom-alien-back').addEventListener('click', () => {
		document.getElementById('custom-alien-screen').classList.add('hidden');
	});
}

// Fonction pour initialiser le canvas de prévisualisation de l'alien
function initCustomAlienCanvas() {
	const customCanvas = document.querySelector('.customAlien');
	const ctx = customCanvas.getContext('2d');

	// Redimensionner le canvas pour éviter les déformations
	customCanvas.width = 300;
	customCanvas.height = 300;

	// Variables pour le dessin
	let isDrawing = false;
	let lastX = 0;
	let lastY = 0;

	// Éléments d'interface pour le dessin
	const colorPicker = document.getElementById('drawing-color');
	const brushSize = document.getElementById('brush-size');
	const clearButton = document.getElementById('clear-drawing');
	const saveButton = document.getElementById('save-drawing');

	// Créer un canvas secondaire pour stocker les dessins
	const drawingCanvas = document.createElement('canvas');
	drawingCanvas.width = customCanvas.width;
	drawingCanvas.height = customCanvas.height;
	const drawingCtx = drawingCanvas.getContext('2d');

	// Charger le dessin précédent si disponible
	const savedDrawing = localStorage.getItem('playerCustomDrawing');
	if (savedDrawing) {
		const savedImage = new Image();
		savedImage.onload = () => {
			drawingCtx.drawImage(savedImage, 0, 0);
		};
		savedImage.src = savedDrawing;
	}

	// Créer un joueur factice pour la prévisualisation
	const previewPlayer = {
		x: customCanvas.width / 2,
		y: customCanvas.height / 2,
		radius: 80,
		direction: 0,
		color: currentPlayer.color || '#3498db',
		eyes: currentPlayer.eyes || 'default',
		mouth: currentPlayer.mouth || 'default',
		pseudo: currentPlayer.pseudo || 'Aperçu',
		accelerating: false,
	};

	// Fonction qui dessine sur le canvas
	function draw(e) {
		if (!isDrawing) return;

		// Obtenir la position de la souris relative au canvas
		const rect = customCanvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		// Configurer le style de dessin
		drawingCtx.lineJoin = 'round';
		drawingCtx.lineCap = 'round';
		drawingCtx.strokeStyle = colorPicker.value;
		drawingCtx.lineWidth = brushSize.value;

		// Dessiner une ligne du dernier point au point actuel
		drawingCtx.beginPath();
		drawingCtx.moveTo(lastX, lastY);
		drawingCtx.lineTo(x, y);
		drawingCtx.stroke();

		// Mettre à jour les dernières coordonnées
		lastX = x;
		lastY = y;
	}

	// Gestionnaires d'événements pour le dessin
	customCanvas.addEventListener('mousedown', e => {
		isDrawing = true;
		const rect = customCanvas.getBoundingClientRect();
		lastX = e.clientX - rect.left;
		lastY = e.clientY - rect.top;
	});

	customCanvas.addEventListener('mousemove', draw);

	customCanvas.addEventListener('mouseup', () => {
		isDrawing = false;
	});

	customCanvas.addEventListener('mouseout', () => {
		isDrawing = false;
	});

	// Bouton pour effacer le dessin
	clearButton.addEventListener('click', () => {
		drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
	});

	// Bouton pour sauvegarder le dessin
	saveButton.addEventListener('click', () => {
		// Sauvegarder le dessin sous forme d'image base64
		const imageData = drawingCanvas.toDataURL('image/png');
		localStorage.setItem('playerCustomDrawing', imageData);
		playerCustomDrawing = imageData;

		// Afficher une notification
		const notification = document.createElement('div');
		notification.className = 'save-notification';
		notification.textContent = 'Dessin sauvegardé !';
		document.querySelector('.custom-alien-content').appendChild(notification);

		// Faire disparaître la notification après 2 secondes
		setTimeout(() => {
			notification.remove();
		}, 2000);
	});

	// Animation pour rendre l'aperçu vivant
	function animatePreview() {
		// Effacer le canvas principal
		ctx.clearRect(0, 0, customCanvas.width, customCanvas.height);

		// Faire bouger légèrement le joueur pour un effet d'animation
		previewPlayer.direction = Math.sin(Date.now() / 1000) * 0.5;
		previewPlayer.accelerating = Math.sin(Date.now() / 500) > 0;

		// Dessiner le joueur de base
		drawPlayer(ctx, previewPlayer);

		// Superposer le dessin de l'utilisateur par-dessus
		ctx.drawImage(drawingCanvas, 0, 0);

		requestAnimationFrame(animatePreview);
	}

	animatePreview();
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

// Setup toggle menu button
function setupToggleMenuButton() {
	const toggleMenuBtn = document.querySelector('#toggle-menu-btn');
	const startScreen = document.querySelector('#start-screen');
	const startGameButton = document.querySelector('#start-game');

	toggleMenuBtn.addEventListener('click', event => {
		event.preventDefault();
		if (startScreen.classList.contains('hidden')) {
			// Show menu and change button text
			startScreen.classList.remove('hidden');
			startScreen.classList.add('overlay');
			startGameButton.textContent = 'Quitter';
		} else {
			// Hide menu and change button text back if not in game-over state
			startScreen.classList.add('hidden');
			startScreen.classList.remove('overlay');
			if (!isPlayerDead) {
				startGameButton.textContent = 'Jouer';
			}
		}
	});

	// Add keyboard shortcut (Escape key) to toggle menu
	document.addEventListener('keydown', event => {
		if (event.key === 'Escape' && !canvas.classList.contains('background')) {
			toggleMenuBtn.click();
		}
	});
}

function setupStartButton() {
	const startGameButton = document.querySelector('#start-game');

	startGameButton.addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('#start-screen');

		// Si le bouton est "Quitter" (overlay actif), quitter le jeu
		if (startScreen.classList.contains('overlay')) {
			quitGame();
		} else {
			// Sinon, démarrer le jeu
			startGame();
		}
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

// Fonction pour quitter le jeu et retourner à l'écran d'accueil
function quitGame() {
	// Reset the game state
	const startScreen = document.querySelector('#start-screen');
	const canvas = document.querySelector('.gameCanvas');
	const score = document.querySelector('.score');
	const toggleMenuBtn = document.querySelector('#toggle-menu-btn');
	const startGameButton = document.querySelector('#start-game');

	// Restore the initial state
	startScreen.classList.remove('overlay');
	canvas.classList.add('background');
	score.classList.add('hidden');
	toggleMenuBtn.classList.add('hidden');
	startGameButton.textContent = 'Jouer';

	// Disconnect from the game
	socket.emit('leaveGame');

	// Clear player data
	Object.keys(currentPlayer).forEach(key => delete currentPlayer[key]);
	Object.keys(otherPlayers).forEach(id => delete otherPlayers[id]);

	// Reset player status
	isPlayerDead = false;
}

// Modifier la fonction startGame pour inclure le dessin personnalisé
function startGame() {
	const startScreen = document.querySelector('#start-screen');
	const canvas = document.querySelector('.gameCanvas');
	const score = document.querySelector('.score');
	const pseudoInput = document.querySelector('#player-pseudo');
	const pseudo = pseudoInput.value.trim() || 'Joueur';
	const toggleMenuBtn = document.querySelector('#toggle-menu-btn');
	const startGameButton = document.querySelector('#start-game');

	startScreen.classList.add('hidden');
	canvas.classList.remove('background');
	score.classList.remove('hidden');
	toggleMenuBtn.classList.remove('hidden');
	isPlayerDead = false;

	// Charger le dessin personnalisé depuis le localStorage si pas déjà en mémoire
	if (!playerCustomDrawing) {
		playerCustomDrawing = localStorage.getItem('playerCustomDrawing');
	}

	// Vérifier si le dessin existe avant de l'envoyer
	console.log(
		'Envoi du dessin personnalisé:',
		playerCustomDrawing ? 'Oui' : 'Non'
	);

	// Ajouter le dessin personnalisé aux données du joueur et au joueur local
	const gameData = {
		pseudo: pseudo,
		startTime: Date.now(),
	};

	// Ajouter le dessin uniquement s'il existe
	if (playerCustomDrawing) {
		gameData.customDrawing = playerCustomDrawing;
		// Ajouter également au joueur local pour le voir immédiatement
		currentPlayer.customDrawing = playerCustomDrawing;
	}

	socket.emit('joinGame', gameData);
}

// init principale
function init() {
	setupSocketEvents();
	setupGlobalEvents();
	setupStartButton();
	setupSettingsButton();
	setupToggleMenuButton();

	// init le mode de contrôle
	document.addEventListener('DOMContentLoaded', () => {
		initControlMode();
	});

	observeCanvas(() => {}, render);
}

init();
