
import { canvas } from './canvas.js';

export function handleKeyDown(event) {
	if (event.key === 'Shift') {
		player.keys['Shift'] = true;
	} else {
		player.keys[event.key] = true;
		if (player.useKeyboard) player.updateVelocity();
	}
}

export function handleKeyUp(event) {
	if (event.key === 'Shift') {
		player.keys['Shift'] = false;
	} else {
		player.keys[event.key] = false;
		if (player.useKeyboard) {
			player.isSliding = true;
		}
	}
}

///////////////////ÉVÉNEMENTS///////////////////
canvas.addEventListener('mousemove', event => {
	const dx = event.offsetX + camera.x - player.x;
	const dy = event.offsetY + camera.y - player.y;
	player.updateMouseMovement(dx, dy);
});

canvas.addEventListener('mousedown', () => {
	player.useMouse = true;
});

canvas.addEventListener('touchmove', event => {
	const touch = event.touches[0];
	const rect = canvas.getBoundingClientRect();
	const touchX = touch.clientX - rect.left + camera.x;
	const touchY = touch.clientY - rect.top + camera.y;

	const dx = touchX - player.x;
	const dy = touchY - player.y;
	player.updateMouseMovement(dx, dy);
});

canvas.addEventListener('touchstart', event => {
	const touch = event.touches[0];
	const rect = canvas.getBoundingClientRect();
	const touchX = touch.clientX - rect.left + camera.x;
	const touchY = touch.clientY - rect.top + camera.y;

	const dx = touchX - player.x;
	const dy = touchY - player.y;
	player.updateMouseMovement(dx, dy);

	player.useMouse = true;
});