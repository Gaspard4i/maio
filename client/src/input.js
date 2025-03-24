import { socket } from './main.js';
import { canvas } from './canvas.js';

/////////////////// CONTRÔLE DU MODE ///////////////////
let currentControlMode = 'keyboard'; // 'keyboard' ou 'mouse'

export function setCurrentControlMode(mode) {
	currentControlMode = mode;
	// si on passe en mode 'mouse', on réinitialise les touches pressées
	if (mode === 'mouse') {
		for (const key in pressedKeys) {
			delete pressedKeys[key]; // vide les touches
		}
		// env un bitmask vide pour arreter les mvnt
		socket.emit('input', 0);
		lastBitmask = 0;
	}
}

/////////////////// CLAVIER ///////////////////

const pressedKeys = {}; // État local des touches
let lastBitmask = 0; // Dernier bitmask envoyé

// mappage des touches vers des bits
const keyMap = {
	ArrowUp: 0b0001,
	ArrowDown: 0b0010,
	ArrowLeft: 0b0100,
	ArrowRight: 0b1000,
	Shift: 0b10000,
};

// calcule le bitmask actuel
function computeBitmask() {
	return Object.keys(pressedKeys).reduce(
		(bitmask, key) => bitmask | (keyMap[key] || 0),
		0
	);
}

// événements clavier
export function handleKeyDown(event) {
	if (currentControlMode === 'mouse') return;

	if (keyMap[event.key]) {
		pressedKeys[event.key] = true;
	}
}

export function handleKeyUp(event) {
	if (currentControlMode === 'mouse') return;

	if (keyMap[event.key]) {
		delete pressedKeys[event.key];
	}
}

// envoi des entrées au serv
function sendInputs() {
	if (currentControlMode === 'keyboard') {
		const currentBitmask = computeBitmask();
		if (currentBitmask !== lastBitmask) {
			socket.emit('input', currentBitmask); // env uniquement le bitmask si il a changé
			lastBitmask = currentBitmask;
		}
	}
	requestAnimationFrame(sendInputs); // limité à 60Hz
}

sendInputs(); // démarre la boucle d'envoi

/////////////////// SOURIS  ///////////////////

let lastMousePosition = { x: 0, y: 0 };
let lastDirection = { dx: 0, dy: 0 };
let isMouseMoving = false;
let mouseAccelerating = false;

// limite les apl fréquent à emitMouseMove
function throttle(func, limit) {
	let lastFunc;
	let lastRan;
	return function (...args) {
		const context = this;
		if (!lastRan) {
			func.apply(context, args);
			lastRan = Date.now();
		} else {
			clearTimeout(lastFunc);
			lastFunc = setTimeout(
				function () {
					if (Date.now() - lastRan >= limit) {
						func.apply(context, args);
						lastRan = Date.now();
					}
				},
				limit - (Date.now() - lastRan)
			);
		}
	};
}

const emitMouseMove = throttle((x, y, canvaWidth, canvaHeight) => {
	// console.log('emitMouseMove');
	socket.emit('mousemove', { x, y, canvaWidth, canvaHeight });
}, 33);

// activer/désactiver l'accel
function toggleMouseAcceleration(isAccelerating) {
	if (currentControlMode !== 'mouse') return;

	mouseAccelerating = isAccelerating;
	socket.emit('mousedown', isAccelerating);
}

canvas.addEventListener('mousemove', event => {
	if (currentControlMode !== 'mouse') return;

	const x = event.offsetX;
	const y = event.offsetY;

	const canvaWidth = canvas.width;
	const canvaHeight = canvas.height;

	const dx = x - canvaWidth / 2;
	const dy = y - canvaHeight / 2;
	const distance = Math.sqrt(dx * dx + dy * dy);

	if (distance > 0) {
		lastDirection = { dx: dx / distance, dy: dy / distance }; // normalisation
		isMouseMoving = true;
	}

	lastMousePosition = { x, y };
	emitMouseMove(x, y, canvaWidth, canvaHeight); // envoi limité
});

// optimise le mouvement continu
setInterval(() => {
	// N'exécuter que si on est en mode souris
	if (currentControlMode !== 'mouse') return;

	if (!isMouseMoving && (lastDirection.dx !== 0 || lastDirection.dy !== 0)) {
		const simulatedX = lastMousePosition.x + lastDirection.dx * 10;
		const simulatedY = lastMousePosition.y + lastDirection.dy * 10;

		if (
			simulatedX >= 0 &&
			simulatedX <= canvas.width &&
			simulatedY >= 0 &&
			simulatedY <= canvas.height
		) {
			socket.emit('mousemove', {
				x: simulatedX,
				y: simulatedY,
				canvaWidth: canvas.width,
				canvaHeight: canvas.height,
			});
		}
	}
	// console.log('isMouseMoving', isMouseMoving);
	isMouseMoving = false;
}, 100); // 100ms

// Gestion du clic gauche pour activer Shift
canvas.addEventListener('mousedown', event => {
	if (currentControlMode === 'mouse') {
		// Activer l'accélération pour n'importe quel bouton de souris (gauche ou droit)
		toggleMouseAcceleration(true);
		event.preventDefault(); // Empêche le menu contextuel du clic droit
	}
});

// Gestion du relâchement de clic pour désactiver Shift
canvas.addEventListener('mouseup', event => {
	if (currentControlMode === 'mouse') {
		toggleMouseAcceleration(false);
	}
});

// Empêche le menu contextuel du clic droit
canvas.addEventListener('contextmenu', event => {
	if (currentControlMode === 'mouse') {
		event.preventDefault();
	}
});

// Capture les clics en dehors du canvas pour désactiver l'accélération
document.addEventListener('mouseup', event => {
	if (currentControlMode === 'mouse' && mouseAccelerating) {
		toggleMouseAcceleration(false);
	}
});

/////////////////// PRÉVENTION DU ZOOM ///////////////////

export function preventZoom() {
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
}
