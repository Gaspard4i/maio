import { socket } from './main.js';

export function handleKeyDown(event) {
	// Émet les événements correspondants
	switch (event.key) {
		case 'Shift':
			handleSocketEvent('accelerate');
			break;
		case 'ArrowUp':
		case 'w':
			handleSocketEvent('up');
			break;
		case 'ArrowDown':
		case 's':
			handleSocketEvent('down');
			break;
		case 'ArrowLeft':
		case 'a':
			handleSocketEvent('left');
			break;
		case 'ArrowRight':
		case 'd':
			handleSocketEvent('right');
			break;
		case 't':
			handleSocketEvent('debug');
			break;
	}
}

export function handleKeyUp(event) {
	// Rien de spécifique à gérer ici pour le moment
}

export function handleSocketEvent(eventName) {
	// Gestionnaire d'événements socket.io
	console.log(`Événement reçu : ${eventName}`);
	socket.emit(eventName);
}

///////////////////ÉVÉNEMENTS///////////////////
// Les événements liés à la souris ont été retirés.
