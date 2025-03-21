import { socket } from './main.js';

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
	requestAnimationFrame(sendInputs); // Limite à 60Hz
}

sendInputs(); // Démarre la boucle d'envoi
