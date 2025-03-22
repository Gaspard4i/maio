import { socket } from './main.js';
import { canvas } from './canvas.js';

const pressedKeys = {}; // État local des touches
let lastBitmask = 0; // Dernier bitmask envoyé

// Mappage des touches vers des bits
const keyMap = {
	ArrowUp: 0b0001,
	ArrowDown: 0b0010,
	ArrowLeft: 0b0100,
	ArrowRight: 0b1000,
	Shift: 0b10000,
};

// Fonction pour calculer le bitmask actuel
function computeBitmask() {
	return Object.keys(pressedKeys).reduce(
		(bitmask, key) => bitmask | (keyMap[key] || 0),
		0
	);
}

// Gestion des événements clavier
export function handleKeyDown(event) {
	if (keyMap[event.key]) {
		pressedKeys[event.key] = true;
	}
}

export function handleKeyUp(event) {
	if (keyMap[event.key]) {
		delete pressedKeys[event.key];
	}
}

// Envoi des entrées au serveur à 60Hz
function sendInputs() {
	const currentBitmask = computeBitmask();
	if (currentBitmask !== lastBitmask) {
		socket.emit('input', currentBitmask); // Envoi uniquement si le bitmask a changé
		lastBitmask = currentBitmask;
	}
	requestAnimationFrame(sendInputs); // Limié à 60Hz
}

sendInputs(); // Démarre la boucle d'envoi

///////////////////MOUSE AND TOUCH///////////////////
// Si jamais vous regardez Mr.Fritsch, j'ai regardé un tuto : https://grafikart.fr/tutoriels/debounce-throttle-642

let lastMousePosition = { x: 0, y: 0 };
let lastDirection = { dx: 0, dy: 0 };
let isMouseMoving = false;

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

canvas.addEventListener('mousemove', event => {
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
	emitMouseMove(x, y, canvaWidth, canvaHeight); // Envoi limité
});

// Optimise le mvmnt continu
setInterval(() => {
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

canvas.addEventListener('mousedown', () => {
	socket.emit('mousedown', true);
});
